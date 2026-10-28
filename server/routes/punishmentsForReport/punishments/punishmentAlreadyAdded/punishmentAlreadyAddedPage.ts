import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import validateForm from './validation'

// Asked when a punishment is added with exactly the same details as one already on the charge
export default class PunishmentAlreadyAddedPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (req: Request, res: Response, error?: FormError): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const duplicate = this.punishmentsService.getUnconfirmedDuplicate(req, chargeNumber)
    if (duplicate?.punishment.redisId !== redisId)
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))

    return res.render(`pages/punishmentAlreadyAdded.njk`, {
      errors: error ? [error] : [],
      chargeNumber,
      punishment: duplicate.punishment,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return this.renderView(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { addAgain } = req.body

    const error = validateForm({ addAgain })
    if (error) return this.renderView(req, res, error)

    // only act on the punishment this question was asked about, so a form left open elsewhere changes nothing
    const duplicate = this.punishmentsService.getUnconfirmedDuplicate(req, chargeNumber)
    if (duplicate?.punishment.redisId === redisId) {
      if (addAgain === 'YES') {
        this.punishmentsService.confirmDuplicatePunishment(req, chargeNumber, redisId)
      } else {
        await this.punishmentsService.deleteSessionPunishments(req, redisId, chargeNumber)
        // a banner saying the punishment was added would now be wrong
        this.punishmentsService.takeSuccessMessage(req, chargeNumber)
      }
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
