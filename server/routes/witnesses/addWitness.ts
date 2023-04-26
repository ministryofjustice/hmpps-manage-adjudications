import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import { WitnessCode } from '../../data/DraftAdjudicationResult'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import StaffDecisionHelper from '../offenceCodeDecisions/staffDecisionHelper'
import DecisionHelper from '../offenceCodeDecisions/decisionHelper'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import OfficerDecisionHelper from '../offenceCodeDecisions/officerDecisionHelper'
import OtherPersonWitnesDecisionHelper from './otherPersonWitnesDecisionHelper'
import Question from '../../offenceCodeDecisions/Question'
import { DecisionForm } from '../offenceCodeDecisions/decisionForm'
import { User } from '../../data/hmppsAuthClient'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

type PageData = {
  errors?: FormError[]
  selectedPerson?: string
  prisoner?: PrisonerResultSummary
  adjudicationNumber?: number
} & DecisionForm

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedAnswerId',
    text: 'Select the type of witness',
  },
}

export default class AddWitnessRoutes {
  constructor(
    private readonly witnessesSessionService: WitnessesSessionService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  private helpers = new Map<WitnessCode, DecisionHelper>([
    [WitnessCode.STAFF, new StaffDecisionHelper(this.userService, this.decisionTreeService)],
    [WitnessCode.OFFICER, new OfficerDecisionHelper(this.userService, this.decisionTreeService)],
    [WitnessCode.OTHER_PERSON, new OtherPersonWitnesDecisionHelper(this.decisionTreeService)],
  ])

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, errors } = pageData
    const { user } = res.locals
    const submitted = req.query.submitted as string
    // we need to save whether this is a submitted edit on the session, so that we don't lose that information as we come back from the search
    if (submitted === 'true') this.witnessesSessionService.setSubmittedEditFlagOnSession(req)

    const prisoner = await this.getPrisoner(
      adjudicationNumber,
      this.witnessesSessionService.getSubmittedEditFlagFromSession(req),
      user
    )
    const selectedAnswerViewData = await this.answerTypeHelper(pageData)?.viewDataFromForm(pageData, user)
    // eslint-disable-next-line no-extra-boolean-cast
    const cancelButtonHref = this.witnessesSessionService.getSubmittedEditFlagFromSession(req)
      ? adjudicationUrls.detailsOfWitnesses.urls.submittedEditModified(adjudicationNumber)
      : adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber)

    return res.render(`pages/addWitness`, {
      errors: errors || [],
      decisionForm: pageData,
      selectedAnswerViewData,
      pageData,
      prisoner,
      cancelButtonHref,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const selectedAnswerId = req.query.selectedAnswerId as string
    const selectedPerson = req.query.selectedPerson as string
    if (selectedPerson && selectedAnswerId) {
      // We are coming back from a user selection.
      const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
      const form = answerTypeHelper.formAfterSearch(selectedAnswerId, selectedPerson)

      return this.renderView(req, res, { ...form, adjudicationNumber })
    }
    if (req.query.selectedAnswerId) {
      // We are coming from delete.
      return this.renderView(req, res, { adjudicationNumber, selectedAnswerId })
    }
    // We are viewing the page normally
    return this.renderView(req, res, { adjudicationNumber })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { selectedAnswerId } = req.body
    if (req.body.deleteUser) {
      return this.deleteUser(req, res, adjudicationNumber)
    }

    if (req.body.searchUser) {
      return this.search(req, res)
    }
    if (!selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], adjudicationNumber })
    }
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    const errors = await answerTypeHelper.validateForm(form, req, res.locals.user)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber })
    }

    const witnessName = await answerTypeHelper.witnessNamesForSession(form, user)
    const witnessToAdd = {
      code: WitnessCode[selectedAnswerId],
      firstName: witnessName.firstName,
      lastName: witnessName.lastName,
      reporter: user.username,
    }

    this.witnessesSessionService.addSessionWitness(req, witnessToAdd, adjudicationNumber)
    const redirectUrl = this.getRedirectUrl(
      this.witnessesSessionService.getSubmittedEditFlagFromSession(req),
      adjudicationNumber
    )
    this.witnessesSessionService.deleteSubmittedEditFlagOnSession(req)
    return res.redirect(redirectUrl)
  }

  deleteUser = async (req: Request, res: Response, adjudicationNumber: number): Promise<void> => {
    const { selectedAnswerId } = req.body

    return this.redirect(
      { pathname: adjudicationUrls.detailsOfWitnesses.urls.add(adjudicationNumber), query: { selectedAnswerId } },
      res
    )
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { selectedAnswerId } = req.body
    const answerTypeHelper = this.answerTypeHelper(selectedAnswerId)
    const form = answerTypeHelper.formFromPost(req)
    req.session.redirectUrl = `${adjudicationUrls.detailsOfWitnesses.urls.add(adjudicationNumber)}?selectedAnswerId=${
      req.body.selectedAnswerId
    }`
    const errors = await answerTypeHelper.validateForm(form, req, res.locals.user)
    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...form, adjudicationNumber })
    }

    req.session.redirectUrl = `${adjudicationUrls.detailsOfWitnesses.urls.add(
      adjudicationNumber
    )}?selectedAnswerId=${selectedAnswerId}`
    return this.redirect(answerTypeHelper.getRedirectUrlForUserSearch(form), res)
  }

  getRedirectUrl = (submitted: boolean, adjudicationNumber: number) => {
    if (submitted) return adjudicationUrls.detailsOfWitnesses.urls.submittedEditModified(adjudicationNumber)
    return adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber)
  }

  getPrisoner = async (adjudicationNumber: number, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      return this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)
    }
    return this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)
  }

  // The helper that knows how to deal with the specifics of a particular decision type.
  private answerTypeHelper(decisionFormOrSelectedAnswerId: DecisionForm | string): DecisionHelper {
    let selectedAnswerId = ''
    if (typeof decisionFormOrSelectedAnswerId === 'string') {
      selectedAnswerId = decisionFormOrSelectedAnswerId
    } else {
      selectedAnswerId = decisionFormOrSelectedAnswerId?.selectedAnswerId
    }
    return selectedAnswerId && this.helpers.get(WitnessCode[selectedAnswerId])
  }

  private decisions(): Question {
    return this.decisionTreeService.getDecisionTree()
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
