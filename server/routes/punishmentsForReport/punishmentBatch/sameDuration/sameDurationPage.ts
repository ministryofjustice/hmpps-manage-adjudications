import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm from './sameDurationValidation'

type PageData = {
  error?: FormError
  sameForAll?: string
}

export default class SameDurationPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, sameForAll } = pageData

    return res.render(`pages/punishmentSameDuration.njk`, {
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

    const batch = this.punishmentsService.getPunishmentBatch(req, chargeNumber)
    if (!batch || batch.items.length < 2) {
      return res.redirect(this.punishmentsService.nextPunishmentBatchUrl(req, chargeNumber))
    }

    let sameForAll: string = null
    if (batch.sameForAll !== undefined) sameForAll = batch.sameForAll ? 'yes' : 'no'
    return this.renderView(req, res, { sameForAll })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { sameForAll } = req.body

    const error = validateForm({ sameForAll })
    if (error) return this.renderView(req, res, { error, sameForAll })

    if (!this.punishmentsService.getPunishmentBatch(req, chargeNumber)) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    this.punishmentsService.setPunishmentBatchSameForAll(req, chargeNumber, sameForAll === 'yes')
    return res.redirect(adjudicationUrls.punishmentDuration.urls.start(chargeNumber))
  }
}
