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
import OtherPersonDecisionHelper from '../offenceCodeDecisions/otherPersonDecisionHelper'
import Question from '../../offenceCodeDecisions/Question'
import { DecisionForm } from '../offenceCodeDecisions/decisionForm'

type PageData = {
  errors?: FormError[]
  selectedPerson?: string
  cancelButtonHref?: string
  prisoner?: PrisonerResultSummary
  adjudicationNumber?: number
} & DecisionForm

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
}

// eslint-disable-next-line no-shadow
export enum WitnessAnswerType {
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  OTHER = 'OTHER',
  // RADIO_SELECTION_ONLY = 'RADIO_SELECTION_ONLY',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedAnswerId',
    text: 'Select an option',
  },
}

export default class AddWitnessRoutes {
  constructor(
    private readonly witnessesSessionService: WitnessesSessionService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helpers = new Map<WitnessAnswerType, DecisionHelper>([
    [WitnessAnswerType.STAFF, new StaffDecisionHelper(this.userService, this.decisionTreeService)],
    [WitnessAnswerType.OFFICER, new OfficerDecisionHelper(this.userService, this.decisionTreeService)],
    [WitnessAnswerType.OTHER, new OtherPersonDecisionHelper(this.decisionTreeService)],
    // [WitnessAnswerType.RADIO_SELECTION_ONLY, new DecisionHelper(this.decisionTreeService)],
  ])

  // private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
  //   const { error, selectedAnswerId, selectedPerson, cancelButtonHref, adjudicationNumber } = pageData
  //   const { user } = res.locals
  //   const prisoner = await this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)

  //   return res.render(`pages/addWitness`, {
  //     errors: error ? [error] : [],
  //     selectedAnswerId,
  //     selectedPerson,
  //     cancelButtonHref,
  //     prisoner,
  //   })
  // }

  // view = async (req: Request, res: Response): Promise<void> => {
  //   // This is the draftId
  //   const adjudicationNumber = Number(req.params.adjudicationNumber)
  //   const selectedAnswerId = req.query.selectedAnswerId as string
  //   const selectedPerson = req.query.selectedPerson as string

  //   return this.renderView(req, res, {
  //     cancelButtonHref: adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber),
  //     adjudicationNumber,
  //     selectedAnswerId,
  //     selectedPerson,
  //   })
  // }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, errors } = pageData
    const { user } = res.locals
    const prisoner = await this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user)
    const selectedAnswerViewData = await this.answerTypeHelper(pageData)?.viewDataFromForm(pageData, user)

    return res.render(`pages/addWitness`, {
      errors: errors || [],
      decisionForm: pageData,
      selectedAnswerViewData,
      pageData,
      prisoner,
      cancelButtonHref: adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber),
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

    console.log(form)

    const witnessToAdd = {
      code: this.convertToWitnessCode(selectedAnswerId),
      // firstName,
      // lastName,
      reporter: user.username,
    }

    // this.witnessesSessionService.addSessionWitness(req, witnessToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber))
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

  // getWitnessName = (req: Request) => {
  //   if (req.body.selectedAnswerId === WitnessCode.OTHER) {
  //     const names = req.body.otherFullNameInput.includes(',')
  //       ? req.body.otherFullNameInput.split(',').reverse()
  //       : req.body.otherFullNameInput.split(' ')
  //     return {
  //       firstName: names[0].trim(),
  //       lastName: names[1].trim(),
  //     }
  //   }
  //   return null
  // }

  // The helper that knows how to deal with the specifics of a particular decision type.
  private answerTypeHelper(decisionFormOrSelectedAnswerId: DecisionForm | string): DecisionHelper {
    let selectedAnswerId = ''
    if (typeof decisionFormOrSelectedAnswerId === 'string') {
      selectedAnswerId = decisionFormOrSelectedAnswerId
    } else {
      selectedAnswerId = decisionFormOrSelectedAnswerId?.selectedAnswerId
    }
    return selectedAnswerId && this.helpers.get(this.getWitnessAnswerType(selectedAnswerId))
  }

  private decisions(): Question {
    return this.decisionTreeService.getDecisionTree()
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }

  getWitnessAnswerType = (selectedAnswerId: string): WitnessAnswerType => {
    switch (selectedAnswerId) {
      case 'OFFICER':
        return WitnessAnswerType.OFFICER
      case 'STAFF':
        return WitnessAnswerType.STAFF
      case 'OTHER':
        return WitnessAnswerType.OTHER
      default:
        return null
    }
  }

  convertToWitnessCode = (selectedAnswerId: string): WitnessCode => {
    switch (selectedAnswerId) {
      case 'OFFICER':
        return WitnessCode.PRISON_OFFICER
      case 'STAFF':
        return WitnessCode.STAFF
      case 'OTHER':
        return WitnessCode.OTHER
      default:
        return null
    }
  }
}
