import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class ActivePunishmentsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response, prisoner: PrisonerResultSummary): Promise<void> => {
    res.render(`pages/activePunishments.njk`, {
      prisonerNumber: req.params.prisonerNumber,
      prisoner,
      adjudicationHistoryHref: adjudicationUrls.adjudicationHistory.urls.start(req.params.prisonerNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
    return this.renderView(req, res, prisoner)
  }
}
