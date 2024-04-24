import url from 'url'
import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import PlaceOnReportService from '../../services/placeOnReportService'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_SELECTION = 'MISSING_SELECTION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#confirmDelete',
    text: 'Select yes if you want to remove this offence',
  },
}

export default class DeleteOffenceRoutes {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly placeOnReportService: PlaceOnReportService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, [])

  private async renderView(req: Request, res: Response, errors: FormError[]) {
    const { user } = res.locals
    const draftId = Number(req.params.draftId)
    const { incidentRole, prisoner, associatedPrisoner, draftAdjudication } =
      await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    const offenceData: OffenceData = { ...req.query }
    const answerData = await this.decisionTreeService.answerDataDetails(offenceData, user)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
      Number(offenceData.offenceCode),
      placeHolderValues,
      incidentRole,
      false,
      offenceData.protectedCharacteristics
    )

    const offenceToDisplay = {
      questionsAndAnswers,
      incidentRule: draftAdjudication.incidentRole?.offenceRule,
      offenceRule: await this.placeOnReportService.getOffenceRule(
        Number(offenceData.offenceCode),
        draftAdjudication.isYouthOffender,
        draftAdjudication.gender,
        user
      ),
      isYouthOffender: draftAdjudication.isYouthOffender,
    }

    return res.render(`pages/deleteOffence`, {
      offence: offenceToDisplay,
      errors,
      offenceData,
    })
  }

  submit = async (req: Request, res: Response) => {
    const { confirmDelete } = req.body
    const draftId = Number(req.params.draftId)
    if (!confirmDelete) {
      return this.renderView(req, res, [error.MISSING_SELECTION])
    }
    if (confirmDelete === 'yes') {
      return res.redirect(adjudicationUrls.detailsOfOffence.urls.modified(draftId))
    }
    const offenceData: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.modified(draftId),
        query: offenceData,
      },
      res
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string | string[] } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
