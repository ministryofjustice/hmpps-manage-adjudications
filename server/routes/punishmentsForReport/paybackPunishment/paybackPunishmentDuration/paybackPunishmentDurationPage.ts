/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  error?: FormError
  duration?: number
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

export default class PaybackPunishmentDurationPage {
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
    const { error, duration } = pageData

    return res.render(`pages/paybackPunishmentDuration.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      duration,
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
        duration: sessionData?.duration,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    // const { chargeNumber, redisId } = req.params
    // const {} = req.body

    // const error = validateForm()

    // if (error)
    //   return this.renderView(req, res, {
    //     error,
    //   })

    const redirectUrl = this.getRedirectUrl()
    return res.redirect(url.format(redirectUrl))
  }

  private getRedirectUrl = () => {
    if (this.pageOptions.isEdit()) {
      return ''
    }
    return ''
  }
}
