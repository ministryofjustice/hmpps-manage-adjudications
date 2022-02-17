import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import { DecisionForm } from './decisionForm'
import { getAndDeleteSessionAnswers, setSessionAnswers } from './decisionSessionHelper'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import PrisonerDecisionHelper from './prisonerDecisionHelper'
import DecisionHelper from './decisionHelper'
import StaffDecisionHelper from './staffDecisionHelper'
import OfficerDecisionHelper from './officerDecisionHelper'
import OtherPersonDecisionHelper from './otherPersonDecisionHelper'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'

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
    [DecisionType.PRISONER, new PrisonerDecisionHelper(this.placeOnReportService)],
    [DecisionType.STAFF, new StaffDecisionHelper(this.userService)],
    [DecisionType.OFFICER, new OfficerDecisionHelper(this.userService)],
    [DecisionType.OTHER_PERSON, new OtherPersonDecisionHelper()],
    [DecisionType.RADIO_SELECTION_ONLY, new DecisionHelper()],
  ])

  private decisions = decisionTree

  view = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    if (req.query.selectedPerson && req.query.selectedDecisionId) {
      // We are coming back from a user selection.
      const selectedPerson = req.query.selectedPerson as string
      const selectedDecisionId = req.query.selectedDecisionId as string
      const helper = this.helper(selectedDecisionId)
      const form = helper.formAfterSearch(selectedDecisionId, selectedPerson)
      return this.renderView(req, res, { ...form, adjudicationNumber, incidentRole })
    }
    // We are viewing the page normally
    return this.renderView(req, res, { adjudicationNumber, incidentRole })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    if (req.body.decisionFormCancel) {
      return this.cancel(req, res)
    }
    if (req.body.deleteUser) {
      return this.deleteUser(req, res)
    }
    if (req.body.searchUser) {
      return this.search(req, res)
    }
    return this.submitDecision(req, res)
  }

  submitDecision = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { selectedDecisionId } = req.body
    // Validation
    if (!selectedDecisionId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], adjudicationNumber, incidentRole })
    }
    const helper = this.helper(selectedDecisionId)
    const form = helper.formFromPost(req)
    const errors = helper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    // Save any data associated with the decisions on the session.
    const currentAnswers = getAndDeleteSessionAnswers(req, adjudicationNumber)
    const updatedAnswers = helper.updatedAnswers(currentAnswers, form)
    setSessionAnswers(req, updatedAnswers, adjudicationNumber)
    // We redirect to the next decision or the details of offence page if this is the last.
    const selectedDecision = this.decisions.findById(form.selectedDecisionId)
    if (!selectedDecision.getOffenceCode()) {
      const nextDecisionUrl = `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`
      return this.redirect(nextDecisionUrl, res)
    }
    return this.redirect({ pathname: `/details-of-offence/${adjudicationNumber}/add`, query: updatedAnswers }, res)
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { user } = res.locals
    const prisonerNumber = await this.placeOnReportService.getPrisonerNumberFromDraftAdjudicationNumber(
      Number(adjudicationNumber),
      user
    )
    return this.redirect(`/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`, res)
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    return this.redirect(this.urlHere(req), res)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { selectedDecisionId } = req.body
    const helper = this.helper(selectedDecisionId)
    const form = helper.formFromPost(req)
    const errors = helper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    req.session.redirectUrl = `${this.urlHere(req)}?selectedDecisionId=${selectedDecisionId}`
    return this.redirect(helper.getRedirectUrlForUserSearch(form), res)
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole, errors } = pageData
    const { user } = res.locals
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getPrisonerDetailsForAdjudication(
      Number(adjudicationNumber),
      user
    )
    const placeholderValues = getPlaceholderValues(prisoner, associatedPrisoner)
    const decision = this.decisions.findByUrl(req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, ''))
    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().getProcessedText(placeholderValues),
        type: d.getType().toString(),
      }
    })
    const selectedDecisionViewData = await this.helper(pageData)?.viewDataFromForm(pageData, user)
    return res.render(`pages/offenceCodeDecisions`, {
      errors: errors || [],
      decisionForm: pageData,
      selectedDecisionViewData,
      questions,
      pageTitle,
      pageData,
    })
  }

  // The helper that knows how to deal with the specifics of a particular decision type.
  private helper(decisionFormOrSelectedDecisionId: DecisionForm | string): DecisionHelper {
    let selectedDecisionId = ''
    if (typeof decisionFormOrSelectedDecisionId === 'string') {
      selectedDecisionId = decisionFormOrSelectedDecisionId
    } else {
      selectedDecisionId = decisionFormOrSelectedDecisionId?.selectedDecisionId
    }
    return selectedDecisionId && this.helpers.get(this.decisions.findById(selectedDecisionId).getType())
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } } | string, res: Response) {
    if (typeof urlQuery === 'string') {
      return res.redirect(urlQuery)
    }
    return res.redirect(url.format(urlQuery))
  }

  private urlHere(req: Request) {
    return `/offence-code-selection${req.path}`
  }
}
