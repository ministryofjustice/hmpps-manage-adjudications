/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import moment from 'moment'
import UserService from '../../../services/userService'
import { hasAnyRole, datePickerDateToMoment, momentDateToDatePicker } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  startDate?: string
  endDate?: string
  days?: number
  type?: PunishmentType
}

export default class AutoPunishmentSchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { startDate, endDate, days, type } = pageData

    return res.render(`pages/autoPunishmentSchedule.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      startDate,
      endDate,
      type,
      days,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { startDate, days, punishmentType } = req.query
    const type = PunishmentType[punishmentType as string]
    const startDateString = startDate.toString()
    const numberOfDaysOfPunishment = Number(days)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const endDate = moment(datePickerDateToMoment(startDateString)).add(numberOfDaysOfPunishment, 'days')

    return this.renderView(req, res, {
      startDate: startDateString,
      endDate: momentDateToDatePicker(endDate),
      days: numberOfDaysOfPunishment,
      type,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days, startDate } = req.query

    // create punishment data and save to session here, redirect to award punishments?
  }
}
