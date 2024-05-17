/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { datePickerToApi, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from './paybackPunishmentDetailsValidation'
import { PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  paybackNotes?: string
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

export default class PaybackPunishmentDetailsPage {
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
    const { error, paybackNotes } = pageData

    return res.render(`pages/paybackPunishmentDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      paybackNotes,
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
        paybackNotes: sessionData?.paybackNotes,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { paybackNotes } = req.body
    const { duration, lastDay } = req.query

    const error = validateForm({ paybackNotes })

    if (error)
      return this.renderView(req, res, {
        error,
        paybackNotes,
      })

    const playbackPunishmentData = {
      type: PunishmentType.PAYBACK,
      endDate: datePickerToApi(String(lastDay)),
      paybackNotes: String(paybackNotes),
      duration: Number(duration),
    }

    if (this.pageOptions.isEdit()) {
      await this.punishmentsService.updateSessionPunishment(req, playbackPunishmentData, chargeNumber, redisId)
    } else {
      await this.punishmentsService.addSessionPunishment(req, playbackPunishmentData, chargeNumber)
    }

    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
