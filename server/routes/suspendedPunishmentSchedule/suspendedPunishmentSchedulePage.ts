import url from 'url'
import { v4 as uuidv4 } from 'uuid'

import { Request, Response } from 'express'
import { FormError } from '../../@types/template'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { datePickerToApi, hasAnyRole } from '../../utils/utils'
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
    const { punishmentType } = req.query

    const { error, days, startDate, endDate } = pageData

    const isTypeAdditionalDays = [PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(
      punishmentType as PunishmentType
    )

    return res.render(`pages/suspendedPunishmentSchedule.njk`, {
      errors: error ? [error] : [],
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      days,
      startDate,
      endDate,
      isTypeAdditionalDays,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { punishmentNumberToActivate, punishmentType } = req.query
    const type = PunishmentType[punishmentType as string]
    const { days, startDate, endDate } = req.body

    const suspendedPunishmentIdToActivate = Number(punishmentNumberToActivate)

    const error = validateForm({
      days,
      startDate,
      endDate,
      punishmentType: type,
    })

    if (error) return this.renderView(req, res, { error, days, startDate, endDate })

    try {
      const { suspendedPunishments } = await this.punishmentsService.getSuspendedPunishmentDetails(
        adjudicationNumber,
        user
      )
      const punishmentToUpdate = suspendedPunishments.filter(susPun => {
        return susPun.punishment.id === suspendedPunishmentIdToActivate
      })

      if (punishmentToUpdate.length) {
        const { punishment, reportNumber } = punishmentToUpdate[0]
        const updatedPunishment = this.updatePunishment(punishment, days, startDate, endDate, reportNumber)
        this.punishmentsService.addSessionPunishment(req, updatedPunishment, adjudicationNumber)
      }
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
    endDate: string,
    activatedFromReportNumber: number
  ): PunishmentData {
    const activePunishment = {
      ...existingPunishment,
      redisId: uuidv4(),
      activatedFrom: activatedFromReportNumber,
      schedule: {
        days,
        startDate: startDate ? datePickerToApi(startDate) : null,
        endDate: endDate ? datePickerToApi(endDate) : null,
        suspendedUntil: null as never,
      },
    }
    return flattenPunishment(activePunishment)
  }
}
