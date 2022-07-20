import { Request, Response } from 'express'
import url from 'url'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import { DecisionForm } from './decisionForm'
import OffenceSessionService from '../../services/offenceSessionService'
import Question from '../../offenceCodeDecisions/Question'
import PrisonerDecisionHelper from './prisonerDecisionHelper'
import DecisionHelper from './decisionHelper'
import StaffDecisionHelper from './staffDecisionHelper'
import OfficerDecisionHelper from './officerDecisionHelper'
import OtherPersonDecisionHelper from './otherPersonDecisionHelper'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import DecisionTreeService from '../../services/decisionTreeService'
import { AnswerType } from '../../offenceCodeDecisions/Answer'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerOutsideEstablishmentDecisionHelper from './prisonerOutsideEstablishmentDecisionHelper'

type PageData = { errors?: FormError[]; adjudicationNumber: number; incidentRole: string } & DecisionForm

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedAnswerId',
    text: 'Select an option',
  },
}

export default class OffenceCodeRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly offenceSessionService: OffenceSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helpers = new Map<AnswerType, DecisionHelper>([
    [AnswerType.PRISONER, new PrisonerDecisionHelper(this.placeOnReportService, this.decisionTreeService)],
    [
      AnswerType.PRISONER_OUTSIDE_ESTABLISHMENT,
      new PrisonerOutsideEstablishmentDecisionHelper(this.decisionTreeService),
    ],
    [AnswerType.STAFF, new StaffDecisionHelper(this.userService, this.decisionTreeService)],
    [AnswerType.OFFICER, new OfficerDecisionHelper(this.userService, this.decisionTreeService)],
    [AnswerType.OTHER_PERSON, new OtherPersonDecisionHelper(this.decisionTreeService)],
    [AnswerType.RADIO_SELECTION_ONLY, new DecisionHelper(this.decisionTreeService)],
  ])

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole } = req.params
    const selectedAnswerId = req.query.selectedAnswerId as string
    const selectedPerson = req.query.selectedPerson as string
    if (selectedPerson && selectedAnswerId) {
      // We are coming back from a user selection.
      const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
      const form = answerTypeHelper.formAfterSearch(selectedAnswerId, selectedPerson)
      return this.renderView(req, res, { ...form, adjudicationNumber, incidentRole })
    }
    if (req.query.selectedAnswerId) {
      // We are coming from delete.
      return this.renderView(req, res, { adjudicationNumber, incidentRole, selectedAnswerId })
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole } = req.params
    const { selectedAnswerId } = req.body
    // Validation
    if (!selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], adjudicationNumber, incidentRole })
    }
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    const errors = answerTypeHelper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    // Save any data associated with the decisions on the session.
    const currentOffenceData = this.offenceSessionService.getAndDeleteOffenceData(req, adjudicationNumber)
    const updatedOffenceData = answerTypeHelper.updatedOffenceData(currentOffenceData, form)
    this.offenceSessionService.setOffenceData(req, updatedOffenceData, adjudicationNumber)
    // We redirect to the next decision or the details of offence page if this is the last.
    const selectedAnswer = this.decisions().findAnswerById(form.selectedAnswerId)
    if (!selectedAnswer.getOffenceCode()) {
      const nextQuestionUrl = `${adjudicationUrls.offenceCodeSelection.urls.question(
        adjudicationNumber,
        incidentRole,
        selectedAnswer.getChildQuestion().id()
      )}`
      return res.redirect(nextQuestionUrl)
    }
    // We have finished - remove the offence data from the session and redirect to the details of offence page with the
    // offence data payload
    const finalOffenceData = this.offenceSessionService.deleteOffenceData(req, adjudicationNumber)
    return this.redirect(
      { pathname: adjudicationUrls.detailsOfOffence.urls.add(adjudicationNumber), query: finalOffenceData },
      res
    )
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.redirect(adjudicationUrls.taskList.urls.start(adjudicationNumber))
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { selectedAnswerId } = req.body
    return this.redirect({ pathname: this.urlHere(req), query: { selectedAnswerId } }, res)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole } = req.params
    const { selectedAnswerId } = req.body
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    const errors = answerTypeHelper.validateForm(form, req)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber, incidentRole })
    }
    req.session.redirectUrl = `${this.urlHere(req)}?selectedAnswerId=${selectedAnswerId}`
    return this.redirect(answerTypeHelper.getRedirectUrlForUserSearch(form), res)
  }

  redirectToStart = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole } = req.params
    res.redirect(
      adjudicationUrls.offenceCodeSelection.urls.question(adjudicationNumber, incidentRole, this.decisions().id())
    )
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole, errors } = pageData
    const { user } = res.locals
    const { questionId } = req.params
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getOffencePrisonerDetails(
      Number(adjudicationNumber),
      user
    )
    const placeholderValues = getPlaceholderValues(prisoner, associatedPrisoner)
    const question = this.decisions().findQuestionById(questionId)
    const pageTitle = question.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const answers = question.getChildAnswers().map(a => {
      return {
        id: a.id(),
        label: a.getProcessedText(placeholderValues, false),
        type: a.getType().toString(),
        offenceCode: a.getOffenceCode(),
      }
    })
    const selectedAnswerViewData = await this.answerTypeHelper(pageData)?.viewDataFromForm(pageData, user)
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
  private answerTypeHelper(decisionFormOrSelectedAnswerId: DecisionForm | string): DecisionHelper {
    let selectedAnswerId = ''
    if (typeof decisionFormOrSelectedAnswerId === 'string') {
      selectedAnswerId = decisionFormOrSelectedAnswerId
    } else {
      selectedAnswerId = decisionFormOrSelectedAnswerId?.selectedAnswerId
    }
    return selectedAnswerId && this.helpers.get(this.decisions().findAnswerById(selectedAnswerId).getType())
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }

  private urlHere(req: Request) {
    return `${adjudicationUrls.offenceCodeSelection.root}${req.path}`
  }

  private decisions(): Question {
    return this.decisionTreeService.getDecisionTree()
  }
}
