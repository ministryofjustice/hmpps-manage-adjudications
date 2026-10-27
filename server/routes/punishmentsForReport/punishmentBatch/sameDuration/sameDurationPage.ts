import type { Request, Response } from 'express'
import type { FormError } from '../../../../@types/template'
import type PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm from './sameDurationValidation'

type PageData = {
  error?: FormError
  sameForAll?: string
}

export default class SameDurationPage {
  constructor(
    private readonly punishmentsService: PunishmentsService,
    private readonly punishmentBatchSessionService: PunishmentBatchSessionService,
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
    const batch = this.punishmentBatchSessionService.get(req, chargeNumber)
    if (!batch || batch.items.length < 2) {
      return res.redirect(this.punishmentBatchSessionService.nextUrl(req, chargeNumber))
    }

    let sameForAll: string = null
    if (batch.sameForAll !== undefined) {
      sameForAll = batch.sameForAll ? 'YES' : 'NO'
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

    if (!this.punishmentBatchSessionService.get(req, chargeNumber)) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    this.punishmentBatchSessionService.setSameForAll(req, chargeNumber, sameForAll === 'YES')
    return res.redirect(adjudicationUrls.punishmentDuration.urls.start(chargeNumber))
  }
}
