/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { DecisionForm } from './decisionForm'
import { DraftAdjudication, GroupedOffenceRulesAndTitles } from '../../data/DraftAdjudicationResult'
import {
  getOffenceCodeFromParagraphNumber,
  getOffenceInformation,
  paragraphNumberToQuestionId,
  paraToNextQuestion,
} from '../../offenceCodeDecisions/DecisionTree'
import adjudicationUrls from '../../utils/urlGenerator'
import { User } from '../../data/hmppsManageUsersClient'
import config from '../../config'

type PageData = {
  errors?: FormError[]
  draftId: number
  incidentRole: string
  offencesAndTitles?: GroupedOffenceRulesAndTitles[]
  prisonerName?: string
} & DecisionForm

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

export default class OffenceListRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { incidentRole } = req.params
    const draftId = Number(req.params.draftId)
    const selectedAnswerId = req.query.selectedAnswerId as string
    const { user } = res.locals

    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)
    const allOffenceRules = await this.getAllOffenceRules(draftAdjudication, user)
    const offencesAndTitles = await getOffenceInformation(
      allOffenceRules,
      draftAdjudication.isYouthOffender,
      +config.offenceVersion
    )
    const prisonerName = await this.placeOnReportService.getPrisonerDetails(draftAdjudication.prisonerNumber, user)

    return this.renderView(req, res, {
      draftId,
      incidentRole,
      offencesAndTitles,
      prisonerName: prisonerName.friendlyName,
      selectedAnswerId,
    })
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { errors, offencesAndTitles, prisonerName } = pageData
    const draftId = Number(req.params.draftId)

    return res.render(`pages/offenceList.njk`, {
      errors: errors || [],
      decisionForm: pageData,
      offencesAndTitles,
      pageData,
      prisonerName,
      cancelButtonHref: adjudicationUrls.prisonerReport.urls.review(draftId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { selectedAnswerId } = req.body
    const draftId = Number(req.params.draftId)
    const { incidentRole } = req.params

    if (!selectedAnswerId) {
      return this.renderView(req, res, { errors: [error.MISSING_DECISION], draftId, incidentRole })
    }

    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)

    const paragraphToNextQuestionMap = paraToNextQuestion(draftAdjudication.isYouthOffender, +config.offenceVersion)

    if (paragraphToNextQuestionMap.some(mapItem => mapItem.para === selectedAnswerId)) {
      const nextPageId = paragraphNumberToQuestionId(
        selectedAnswerId,
        draftAdjudication.isYouthOffender,
        +config.offenceVersion
      )
      return res.redirect(adjudicationUrls.offenceCodeSelection.urls.aloEditQuestion(draftId, incidentRole, nextPageId))
    }
    const chosenOffenceCode = await getOffenceCodeFromParagraphNumber(
      selectedAnswerId,
      draftAdjudication.isYouthOffender
    )
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.aloAdd(draftId),
        query: { offenceCode: `${chosenOffenceCode}` },
      },
      res
    )
  }

  getAllOffenceRules = async (draftAdjudication: DraftAdjudication, user: User) => {
    return this.placeOnReportService.getAllOffenceRules(
      draftAdjudication.isYouthOffender,
      draftAdjudication.gender,
      user
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
