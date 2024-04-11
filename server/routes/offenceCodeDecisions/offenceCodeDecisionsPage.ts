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

type PageData = { errors?: FormError[]; draftId: number; incidentRole: string } & DecisionForm

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
  MISSING_CHARACTERISTIC = 'MISSING_CHARACTERISTIC',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedAnswerId',
    text: 'Select an option',
  },
  MISSING_CHARACTERISTIC: {
    href: '#protectedCharacteristics',
    text: 'Select at least one characteristic',
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

export default class OffenceCodeRoutes {
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
    const { selectedAnswerId, protectedCharacteristics, protectedCharacteristicPage } = req.body
    const offenceToAdd: OffenceData = { ...req.query }

    // Validation
    if (!protectedCharacteristicPage && !selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], draftId: draftChargeId, incidentRole })
    }
    if (protectedCharacteristicPage && (!protectedCharacteristics || !protectedCharacteristics.length)) {
      return this.renderView(req, res, { errors: [error.MISSING_CHARACTERISTIC], draftId: draftChargeId, incidentRole })
    }
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    const errors = await answerTypeHelper.validateForm(form, req, res.locals.user)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, draftId: draftChargeId, incidentRole })
    }

    const updatedOffenceData = answerTypeHelper.updatedOffenceData(offenceToAdd, form)
    const selectedAnswer = this.decisions(form.selectedAnswerId).findAnswerById(form.selectedAnswerId)
    if (!selectedAnswer.getOffenceCode()) {
      let nextQuestionUrl = ''
      if (this.pageOptions.isAloEdit()) {
        nextQuestionUrl = `${adjudicationUrls.offenceCodeSelection.urls.aloEditQuestion(
          draftChargeId,
          incidentRole,
          selectedAnswer.getChildQuestion().id()
        )}`
      } else {
        nextQuestionUrl = `${adjudicationUrls.offenceCodeSelection.urls.question(
          draftChargeId,
          incidentRole,
          selectedAnswer.getChildQuestion().id()
        )}`
      }
      return this.redirect(
        {
          pathname: nextQuestionUrl,
          query: updatedOffenceData,
        },
        res
      )
    }
    // We have finished - remove the offence data from the session and redirect to the details of offence page with the
    // offence data payload
    if (this.pageOptions.isAloEdit()) {
      return this.redirect(
        { pathname: adjudicationUrls.detailsOfOffence.urls.aloAdd(draftChargeId), query: updatedOffenceData },
        res
      )
    }
    return this.redirect(
      { pathname: adjudicationUrls.detailsOfOffence.urls.add(draftChargeId), query: updatedOffenceData },
      res
    )
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

  redirectToStart = async (req: Request, res: Response): Promise<void> => {
    const { incidentRole, draftId } = req.params
    const draftChargeId = Number(draftId)
    if (this.pageOptions.isAloEdit())
      return res.redirect(
        adjudicationUrls.offenceCodeSelection.urls.aloEditQuestion(
          draftChargeId,
          incidentRole,
          this.decisions(null).id()
        )
      )
    return res.redirect(
      adjudicationUrls.offenceCodeSelection.urls.question(draftChargeId, incidentRole, this.decisions(null).id())
    )
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { draftId, incidentRole, errors } = pageData
    const draftChargeId = Number(draftId)
    const { user } = res.locals
    const { questionId } = req.params
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getOffencePrisonerDetails(
      draftChargeId,
      user
    )
    const placeholderValues = getPlaceholderValues(prisoner, associatedPrisoner)
    const question = this.decisions(questionId).findQuestionById(questionId)
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
    const renderProtectedCharactersisticsPage = false

    if (renderProtectedCharactersisticsPage) {
      return res.render(`pages/offenceCodeProtectedCharacteristics`, {
        errors: errors || [],
      })
    }
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
    return (
      selectedAnswerId && this.helpers.get(this.decisions(selectedAnswerId).findAnswerById(selectedAnswerId).getType())
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }

  private urlHere(req: Request) {
    return `${adjudicationUrls.offenceCodeSelection.root}${req.path}`
  }

  private decisions(key: string): Question {
    return this.decisionTreeService.getDecisionTree(key)
  }
}
