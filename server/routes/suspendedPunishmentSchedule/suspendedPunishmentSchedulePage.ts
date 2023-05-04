import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import PunishmentsService from '../../services/punishmentsService'
import { PunishmentData, PunishmentType, SuspendedPunishment, flattenPunishment } from '../../data/PunishmentResult'
import validateForm from './suspendedPunishmentScheduleValidation'

type PageData = {
  error?: FormError
  days?: number
  startDate?: string
  endDate?: string
}

export default class SuspendedPunishmentSchedulePage {
  constructor(private readonly punishmentsService: PunishmentsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error } = pageData

    // const additionalDays = do a check on the punishment to see if it is additional days or prospective additional days and pass that in to decide whether to show start and end dates

    return res.render(`pages/suspendedPunishmentSchedule.njk`, {
      errors: error ? [error] : [],
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      //   additionalDays,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { punishmentNumberToActivate, punishmentType } = req.query
    const type = PunishmentType[punishmentType as string]
    const { days, startDate, endDate } = req.body

    const activatePunishmentId = Number(punishmentNumberToActivate)

    const error = validateForm({
      days,
      startDate,
      endDate,
      punishmentType: type,
    })

    if (error) return this.renderView(req, res, { error, days, startDate, endDate })

    try {
      const suspendedPunishments = await (
        await this.punishmentsService.getSuspendedPunishmentDetails(adjudicationNumber, user)
      ).suspendedPunishments
      const punishmentToActivate = suspendedPunishments.filter(punishment => {
        return punishment.punishment.id === activatePunishmentId
      })[0]?.punishment

      const updatedPunishment = this.updatePunishment(punishmentToActivate, days, startDate, endDate)

      this.punishmentsService.addSessionPunishment(req, updatedPunishment, adjudicationNumber)
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.activateSuspendedPunishments.urls.start(adjudicationNumber)
      throw postError
    }

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
        query: {},
      })
    )
  }

  updatePunishment(
    existingPunishment: SuspendedPunishment,
    days: number,
    startDate: string,
    endDate: string
  ): PunishmentData {
    const activePunishment = {
      ...existingPunishment,
      schedule: {
        days,
        startDate,
        endDate,
        suspendedUntil: null as never,
      },
    }
    return flattenPunishment(activePunishment)
  }
}
