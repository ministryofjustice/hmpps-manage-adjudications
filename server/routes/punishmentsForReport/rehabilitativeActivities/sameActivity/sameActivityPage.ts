import type { Request, Response } from 'express'
import type { FormError } from '../../../../@types/template'
import type UserService from '../../../../services/userService'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm from './sameActivityValidation'

type PageData = {
  error?: FormError
  sameForAll?: string
}

export default class SameActivityPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly rehabBatchSessionService: RehabBatchSessionService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, sameForAll } = pageData

    return res.render(`pages/sameRehabilitativeActivity.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      sameForAll,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const batch = this.rehabBatchSessionService.get(req, chargeNumber)
    if (!batch || batch.redisIds.length < 2) {
      return res.redirect(this.rehabBatchSessionService.nextUrl(req, chargeNumber))
    }

    let sameForAll: string = null
    if (batch.sameForAll !== undefined) {
      sameForAll = batch.sameForAll ? 'yes' : 'no'
    }
    return this.renderView(req, res, { sameForAll })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { sameForAll } = req.body

    const error = validateForm({ sameForAll })
    if (error) {
      return this.renderView(req, res, { error, sameForAll })
    }

    if (!this.rehabBatchSessionService.get(req, chargeNumber)) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    this.rehabBatchSessionService.setSameForAll(req, chargeNumber, sameForAll === 'yes')
    return res.redirect(this.rehabBatchSessionService.nextUrl(req, chargeNumber))
  }
}
