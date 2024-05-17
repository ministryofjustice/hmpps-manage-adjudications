/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentMeasurement, PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'
import validateForm from './paybackPunishmentSpecificsValidation'

type PageData = {
  error?: FormError
  paybackPunishmentSpecifics?: string
}

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class PaybackPunishmentSpecificsPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, paybackPunishmentSpecifics } = pageData

    // const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)

    return res.render(`pages/paybackPunishmentSpecifics.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      paybackPunishmentSpecifics,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)
      return this.renderView(req, res, {
        paybackPunishmentSpecifics: sessionData?.duration ? 'YES' : 'NO',
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { paybackPunishmentSpecifics } = req.body

    const error = validateForm({ paybackSpecificsChoice: paybackPunishmentSpecifics })

    if (error)
      return this.renderView(req, res, {
        error,
      })

    if (paybackPunishmentSpecifics === 'NO') {
      const punishmentData = {
        type: PunishmentType.PAYBACK,
        measurement: PunishmentMeasurement.HOURS,
        duration: null as never,
        lastDay: null as never,
        rehabilitativeActivities: [] as RehabilitativeActivity[],
      }
      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
    }

    const redirectUrl = this.getRedirectUrl(chargeNumber, req)
    return res.redirect(url.format(redirectUrl))
  }

  private getRedirectUrl = (chargeNumber: string, req: Request) => {
    if (req.body.paybackPunishmentSpecifics === 'YES') {
      if (this.pageOptions.isEdit()) {
        return adjudicationUrls.paybackPunishmentDuration.urls.edit(chargeNumber, req.params.redisId)
      }
      return adjudicationUrls.paybackPunishmentDuration.urls.start(chargeNumber)
    }
    return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
  }
}
