import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import { ActivePunishment } from '../../data/PunishmentResult'
import PunishmentsService from '../../services/punishmentsService'

export default class ActivePunishmentsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    prisoner: PrisonerResultSummary,
    punishments: ActivePunishment[],
  ): Promise<void> => {
    res.render(`pages/activePunishments.njk`, {
      prisonerNumber: req.params.prisonerNumber,
      prisoner,
      punishments,
      adjudicationHistoryHref: adjudicationUrls.adjudicationHistory.urls.start(req.params.prisonerNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
    const punishments = await this.punishmentsService.getActivePunishmentsByOffender(prisoner.bookingId, user)
    return this.renderView(req, res, prisoner, punishments)
  }
}
