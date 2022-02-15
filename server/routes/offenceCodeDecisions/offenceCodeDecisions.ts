import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName } from '../../utils/utils'
import { DecisionForm } from './decisionForm'
import { getAndDeleteSessionDecisionForm, setSessionDecisionForm } from './offenceCodeDecisionSessionHelper'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { User } from '../../data/hmppsAuthClient'
import PrisonerDecisionHelper from './prisonerDecisionHelper'
import DecisionHelper from './decisionHelper'
import StaffDecisionHelper from './staffDecisionHelper'
import OfficerDecisionHelper from './officerDecisionHelper'
import AnotherDecisionHelper from './anotherDecisionHelper'

type PageData = { errors?: FormError[]; adjudicationNumber: string; incidentRole: string } & DecisionForm

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedDecisionId',
    text: 'Please make a choice',
  },
}

export default class OffenceCodeRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private helpers = new Map<DecisionType, DecisionHelper>([
    [DecisionType.PRISONER, new PrisonerDecisionHelper()],
    [DecisionType.STAFF, new StaffDecisionHelper()],
    [DecisionType.OFFICER, new OfficerDecisionHelper()],
    [DecisionType.ANOTHER, new AnotherDecisionHelper()],
    [DecisionType.RADIO_SELECTION_ONLY, new DecisionHelper()],
  ])

  private decisions = decisionTree

  view = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    if (req.query.selectedPerson) {
      // We are coming back from a user selection. We want to record this in the DecisionForm stored on the session and
      // then redirect to the view page after removing the request parameter.
      const currentForm = getAndDeleteSessionDecisionForm(req, adjudicationNumber)
      const updatedForm = this.helper(currentForm).updatedDecisionForm(currentForm, req.query.selectedPerson as string)
      setSessionDecisionForm(req, updatedForm, adjudicationNumber)
      return this.redirect(this.urlHere(req), res)
    }
    // We are viewing this page. If we have come from a user selection then we should have the previous state of the
    // form in the session, so we render that now and remove it from the session.
    return this.renderView(req, res, {
      ...(getAndDeleteSessionDecisionForm(req, adjudicationNumber) || {}),
      adjudicationNumber,
      incidentRole,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { user } = res.locals
    // Perform actions we don't need to validate for
    if (req.body.decisionFormCancel) {
      const prisonerNumber = await this.getPrisonerNumberFromDraftAdjudicationNumber(adjudicationNumber, user)
      return this.redirect(`/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`, res)
    }
    if (req.body.deleteUser) {
      return this.redirect(this.urlHere(req), res)
    }
    // Default Validation
    const { selectedDecisionId } = req.body
    if (!selectedDecisionId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], adjudicationNumber, incidentRole })
    }
    // Validate
    const helper = this.helper(selectedDecisionId)
    const decisionForm = helper.decisionFormFromPost(req)
    const errors = helper.validateDecisionForm(decisionForm, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...decisionForm, adjudicationNumber, incidentRole })
    }
    // We are navigating away from this page, we need save the state of the page on the session.
    if (req.body.searchUser) {
      setSessionDecisionForm(req, decisionForm, adjudicationNumber)
      req.session.redirectUrl = this.urlHere(req)
      return this.redirect(helper.getRedirectUrlForUserSearch(decisionForm), res)
    }

    // Are there more decisions to be made?
    const selectedDecision = this.decisions.findById(decisionForm.selectedDecisionId)
    const redirectUrl = selectedDecision.getCode()
      ? `/TODO`
      : `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`

    return this.redirect(redirectUrl, res)
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole, errors } = pageData
    const { user } = res.locals
    const decisionForm = pageData
    const placeholderValues = await this.placeholderValues(adjudicationNumber, user)
    const decision = this.decisions.findByUrl(req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, ''))
    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().getProcessedText(placeholderValues),
        type: d.getType().toString(),
      }
    })
    const selectedDecisionViewData = await this.selectedDecisionViewData(decisionForm, user)
    return res.render(`pages/offenceCodeDecisions`, {
      errors: errors || [],
      decisionForm,
      selectedDecisionViewData,
      questions,
      pageTitle,
      pageData,
    })
  }

  private async selectedDecisionViewData(decisionForm: DecisionForm, user: User) {
    if (decisionForm?.selectedDecisionId)
      return this.helper(decisionForm).viewDataFromDecisionForm(
        decisionForm,
        user,
        this.userService,
        this.placeOnReportService
      )
    return {}
  }

  // This information is used to fill out specific details in questions and titles.
  private async placeholderValues(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.getDraftAdjudication(adjudicationNumber, user)
    const [prisonerDetails, associatedPrisoner] = await Promise.all([
      this.getPrisonerDetails(draftAdjudication.prisonerNumber, user),
      this.getPrisonerDetails(draftAdjudication?.incidentRole?.associatedPrisonersNumber, user),
    ])
    return {
      offenderFirstName: properCaseName(prisonerDetails?.firstName),
      offenderLastName: properCaseName(prisonerDetails?.lastName),
      assistedFirstName: properCaseName(associatedPrisoner?.firstName),
      assistedLastName: properCaseName(associatedPrisoner?.lastName),
    }
  }

  private async getPrisonerNumberFromDraftAdjudicationNumber(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.getDraftAdjudication(adjudicationNumber, user)
    const prisonerDetails = await this.getPrisonerDetails(draftAdjudication.prisonerNumber, user)
    return prisonerDetails.prisonerNumber
  }

  private async getPrisonerDetails(prisonerNumber: string, user: User) {
    if (prisonerNumber) {
      return this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    }
    return null
  }

  private async getDraftAdjudication(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    return draftAdjudication?.draftAdjudication
  }

  private redirect(pathAndQuery: { pathname: string; query?: { [key: string]: string } } | string, res: Response) {
    if (typeof pathAndQuery === 'string') {
      return res.redirect(pathAndQuery)
    }
    return res.redirect(url.format(pathAndQuery))
  }

  private urlHere(req: Request) {
    return `/offence-code-selection${req.path}`
  }

  private helper(decisionFormOrSelectedDecisionId: DecisionForm | string): DecisionHelper {
    let selectedDecisionId = ''
    if (typeof decisionFormOrSelectedDecisionId === 'string') {
      selectedDecisionId = decisionFormOrSelectedDecisionId
    } else {
      selectedDecisionId = decisionFormOrSelectedDecisionId?.selectedDecisionId
    }
    return selectedDecisionId && this.helpers.get(this.decisions.findById(selectedDecisionId).getType())
  }
}
