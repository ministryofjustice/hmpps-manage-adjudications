/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  endDate?: string
  duration?: number
  paybackNotes?: string
  redisId?: string
}

export default class PaybackPunishmentScheduleRoute {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { endDate, duration, paybackNotes, redisId } = pageData

    const durationChangeHref = url.format({
      pathname: adjudicationUrls.paybackPunishmentDuration.urls.edit(chargeNumber, redisId),
      query: {
        duration,
      } as ParsedUrlQueryInput,
    })

    const endDateChangeHref = url.format({
      pathname: adjudicationUrls.paybackPunishmentCompletionDate.urls.edit(chargeNumber, redisId),
      query: {
        duration,
        endDate,
      } as ParsedUrlQueryInput,
    })

    const detailsChangeHref = url.format({
      pathname: adjudicationUrls.paybackPunishmentDetails.urls.edit(chargeNumber, redisId),
      query: {
        duration,
        paybackNotes,
        endDate,
      } as ParsedUrlQueryInput,
    })

    return res.render(`pages/paybackPunishmentSchedule.njk`, {
      chargeNumber,
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      endDateChangeHref,
      durationChangeHref,
      detailsChangeHref,
      endDate,
      duration,
      paybackNotes,
      redisId,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const lastAddedPunishment = sessionPunishments[sessionPunishments.length - 1] || {}
    if (!lastAddedPunishment) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    return this.renderView(req, res, {
      endDate: lastAddedPunishment.endDate,
      duration: lastAddedPunishment.duration,
      paybackNotes: lastAddedPunishment.paybackNotes,
      redisId: lastAddedPunishment.redisId,
    })
  }
}
