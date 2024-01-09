import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import { PunishmentDataWithSchedule, PunishmentType } from '../../data/PunishmentResult'

export default class ActivePunishmentsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    prisoner: PrisonerResultSummary,
    punishments: PunishmentDataWithSchedule[]
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
    const punishments = [
      {
        type: PunishmentType.DAMAGES_OWED,
        comment: '£50',
        schedule: {
          days: 10,
          startDate: '01/10/2024',
          endDate: '01/20/2024',
        },
      },
      {
        type: PunishmentType.EARNINGS,
        stoppagePercentage: 10,
        schedule: {
          days: 20,
          startDate: '01/10/2024',
          endDate: '01/30/2024',
        },
      },
      {
        type: PunishmentType.CONFINEMENT,
        schedule: {
          days: 5,
          startDate: '01/11/2024',
          endDate: '01/16/2024',
        },
      },
    ]
    return this.renderView(req, res, prisoner, punishments)
  }
}
