/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import { DecisionForm } from './decisionForm'
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
import PrisonerSearchService from '../../services/prisonerSearchService'
import { OffenceData } from './offenceData'
import { User } from '../../data/hmppsManageUsersClient'
import { OffenceRule, OffenceRuleWithCode } from '../../data/DraftAdjudicationResult'

type PageData = { errors?: FormError[]; draftId: number; incidentRole: string } & DecisionForm

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

export enum PageRequestType {
  REPORTER,
  EDIT_ALO,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isAloEdit(): boolean {
    return this.pageType === PageRequestType.EDIT_ALO
  }
}

export default class OffenceListRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly prisonerSearchService: PrisonerSearchService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private helpers = new Map<AnswerType, DecisionHelper>([
    [AnswerType.PRISONER, new PrisonerDecisionHelper(this.placeOnReportService, this.decisionTreeService)],
    [
      AnswerType.PRISONER_OUTSIDE_ESTABLISHMENT,
      new PrisonerOutsideEstablishmentDecisionHelper(this.decisionTreeService, this.prisonerSearchService),
    ],
    [AnswerType.STAFF, new StaffDecisionHelper(this.userService, this.decisionTreeService)],
    [AnswerType.OFFICER, new OfficerDecisionHelper(this.userService, this.decisionTreeService)],
    [AnswerType.OTHER_PERSON, new OtherPersonDecisionHelper(this.decisionTreeService)],
    [AnswerType.RADIO_SELECTION_ONLY, new DecisionHelper(this.decisionTreeService)],
  ])

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { incidentRole } = req.params
    const selectedAnswerId = req.query.selectedAnswerId as string
    const selectedPerson = req.query.selectedPerson as string
    if (selectedPerson && selectedAnswerId) {
      // We are coming back from a user selection.
      const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
      const form = answerTypeHelper.formAfterSearch(selectedAnswerId, selectedPerson)
      return this.renderView(req, res, { ...form, draftId, incidentRole })
    }
    if (req.query.selectedAnswerId) {
      // We are coming from delete.
      return this.renderView(req, res, { draftId, incidentRole, selectedAnswerId })
    }
    // We are viewing the page normally
    return this.renderView(req, res, { draftId, incidentRole })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    if (req.body.decisionFormCancel) {
      return this.cancel(req, res, this.pageOptions, user)
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
    const { incidentRole, draftId } = req.params
    const draftChargeId = Number(draftId)
    const { selectedAnswerId } = req.body

    // Validation
    if (!selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], draftId: draftChargeId, incidentRole })
    }

    const selectedAnswer = this.decisions().findAnswerByCode(Number(selectedAnswerId))
    if (selectedAnswer.getOffenceCode()) {
      let nextQuestionUrl = ''
      if (this.pageOptions.isAloEdit()) {
        nextQuestionUrl = `${adjudicationUrls.offenceCodeSelection.urls.aloEditQuestion(
          draftChargeId,
          incidentRole,
          selectedAnswer.getParentQuestion().id()
        )}`
      } else {
        const questionsAndAnswersToGetHere = selectedAnswer.getQuestionsAndAnswersToGetHere()
        const firstOffenceListQuestion = questionsAndAnswersToGetHere
          .filter(qs => qs.question.getFirstOffenceListQuestion())[0]
          .question.id()
        nextQuestionUrl = `${adjudicationUrls.offenceCodeSelection.urls.question(
          draftChargeId,
          'committed',
          firstOffenceListQuestion
        )}`
      }
      return this.redirect(
        {
          pathname: nextQuestionUrl,
          // query: updatedOffenceData,
        },
        res
      )
    }
  }

  cancel = async (req: Request, res: Response, pageOptions: PageOptions, user: User): Promise<void> => {
    const draftId = Number(req.params.draftId)
    if (pageOptions.isAloEdit()) {
      try {
        const draftAdj = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)
        return res.redirect(adjudicationUrls.prisonerReport.urls.review(draftAdj.draftAdjudication.chargeNumber))
      } catch (getCancelError) {
        res.locals.redirectUrl = adjudicationUrls.homepage.root
        throw getCancelError
      }
    }
    return res.redirect(adjudicationUrls.taskList.urls.start(draftId))
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { selectedAnswerId } = req.body
    return this.redirect({ pathname: this.urlHere(req), query: { selectedAnswerId } }, res)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const { incidentRole, draftId } = req.params
    const draftChargeId = Number(draftId)
    const { selectedAnswerId } = req.body
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    const errors = await answerTypeHelper.validateForm(form, req, res.locals.user)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, draftId: draftChargeId, incidentRole })
    }
    req.session.redirectUrl = `${this.urlHere(req)}?selectedAnswerId=${selectedAnswerId}`
    return this.redirect(answerTypeHelper.getRedirectUrlForUserSearch(form), res)
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { errors } = pageData
    // these would come from the backend, similar to placeOnReportService.getOffenceRule, but probably getAllOffenceRules
    const questions: OffenceRuleWithCode[] = [
      {
        paragraphNumber: '25(c)',
        paragraphDescription: 'Disobeys any lawful order',
        offenceCode: 22001,
      },
      {
        paragraphNumber: '1(a)',
        paragraphDescription: 'Commits any racially aggravated assault',
        offenceCode: 1007,
      },
    ]

    return res.render(`pages/offenceList`, {
      errors: errors || [],
      decisionForm: pageData,
      questions,
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
