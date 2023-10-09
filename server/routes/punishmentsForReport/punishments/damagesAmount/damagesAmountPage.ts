/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import UserService from '../../../../services/userService'
import { PunishmentType } from '../../../../data/PunishmentResult'
import { FormError } from '../../../../@types/template'
import validateForm from './damagesAmountValidation'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError
  damagesOwedAmount?: number
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class DamagesAmountPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, damagesOwedAmount } = pageData

    return res.render(`pages/damagesAmount.njk`, {
      errors: error ? [error] : [],
      chargeNumber,
      damagesOwedAmount,
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    let damagesOwed = null
    if (this.pageOptions.isEdit()) {
      damagesOwed = this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId).damagesOwedAmount
    }
    return this.renderView(req, res, { damagesOwedAmount: damagesOwed })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { damagesOwedAmount } = req.body

    const error = validateForm({
      damagesOwedAmount,
    })

    if (error) return this.renderView(req, res, { error, damagesOwedAmount })

    const punishmentData = {
      type: PunishmentType.DAMAGES_OWED,
      days: 0,
      damagesOwedAmount,
    }

    try {
      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
      throw postError
    }
  }
}
