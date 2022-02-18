import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import { DecisionForm } from './decisionForm'
import { getAndDeleteOffenceData, setOffenceData } from './decisionSessionHelper'
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
    href: '#selectedAnswerId',
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
    if (req.query.selectedPerson && req.query.selectedAnswerId) {
      // We are coming back from a user selection.
      const selectedPerson = req.query.selectedPerson as string
      const selectedAnswerId = req.query.selectedAnswerId as string
      const helper = this.helper(selectedAnswerId)
      const form = helper.formAfterSearch(selectedAnswerId, selectedPerson)
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
    const { selectedAnswerId } = req.body
    // Validation
    if (!selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], adjudicationNumber, incidentRole })
    }
    const helper = this.helper(selectedAnswerId)
    const form = helper.formFromPost(req)
    const errors = helper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    // Save any data associated with the decisions on the session.
    const currentOffenceData = getAndDeleteOffenceData(req, adjudicationNumber)
    const updatedOffenceData = helper.updatedOffenceData(currentOffenceData, form)
    setOffenceData(req, updatedOffenceData, adjudicationNumber)
    // We redirect to the next decision or the details of offence page if this is the last.
    const selectedAnswer = this.decisions.findAnswerById(form.selectedAnswerId)
    if (!selectedAnswer.getOffenceCode()) {
      const nextQuestionUrl = `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedAnswer
        .getChildDecision()
        .getUrl()}`
      return this.redirect(nextQuestionUrl, res)
    }
    return this.redirect({ pathname: `/details-of-offence/${adjudicationNumber}/add`, query: updatedOffenceData }, res)
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
    const { selectedAnswerId } = req.body
    const helper = this.helper(selectedAnswerId)
    const form = helper.formFromPost(req)
    const errors = helper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    req.session.redirectUrl = `${this.urlHere(req)}?selectedAnswerId=${selectedAnswerId}`
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
    const decision = this.decisions.findDecisionByUrl(req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, ''))
    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const answers = decision.getChildAnswers().map(a => {
      return {
        id: a.id(),
        label: a.getProcessedText(placeholderValues),
        type: a.getType().toString(),
      }
    })
    const selectedAnswerViewData = await this.helper(pageData)?.viewDataFromForm(pageData, user)
    return res.render(`pages/offenceCodeDecisions`, {
      errors: errors || [],
      decisionForm: pageData,
      selectedAnswerViewData,
      answers,
      pageTitle,
      pageData,
    })
  }

  // The helper that knows how to deal with the specifics of a particular decision type.
  private helper(decisionFormOrSelectedAnswerId: DecisionForm | string): DecisionHelper {
    let selectedAnswerId = ''
    if (typeof decisionFormOrSelectedAnswerId === 'string') {
      selectedAnswerId = decisionFormOrSelectedAnswerId
    } else {
      selectedAnswerId = decisionFormOrSelectedAnswerId?.selectedAnswerId
    }
    return selectedAnswerId && this.helpers.get(this.decisions.findAnswerById(selectedAnswerId).getType())
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
