import type { Request, Response } from 'express'
import type { FormError } from '../../../../@types/template'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import type { PunishmentData } from '../../../../data/PunishmentResult'
import { canHaveRehabilitativeActivity, convertPunishmentType } from '../../../../data/PunishmentResult'
import { formatTimestampTo } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm from './whichPunishmentsValidation'

type PageData = {
  error?: FormError
  redisIds?: string[]
}

const toArray = (value: string | string[]): string[] => {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

export default class WhichPunishmentsPage {
  constructor(
    private readonly punishmentsService: PunishmentsService,
    private readonly rehabBatchSessionService: RehabBatchSessionService,
  ) {}

  // Suspended punishments on this report that can have a rehabilitative activity condition, in table order
  private eligiblePunishments = async (req: Request, res: Response): Promise<PunishmentData[]> => {
    const { chargeNumber } = req.params
    const punishments: PunishmentData[] = (
      this.punishmentsService.getAllSessionPunishments(req, chargeNumber) || []
    ).filter((punishment: PunishmentData) => canHaveRehabilitativeActivity(punishment))
    if (!punishments.length) {
      return []
    }
    const { isIndependentAdjudicatorHearing } = await this.punishmentsService.getPunishmentAvailability(
      chargeNumber,
      res.locals.user,
    )
    return isIndependentAdjudicatorHearing ? [] : punishments
  }

  private renderView = async (
    req: Request,
    res: Response,
    punishments: PunishmentData[],
    pageData: PageData,
  ): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, redisIds } = pageData

    return res.render(`pages/whichPunishmentsHaveRehabilitativeActivities.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      items: punishments.map(punishment => ({
        value: punishment.redisId,
        text: convertPunishmentType(
          punishment.type,
          punishment.stoppagePercentage,
          punishment.privilegeType,
          punishment.otherPrivilege,
        ),
        hint: { text: `Suspended until ${formatTimestampTo(punishment.suspendedUntil, 'D MMMM YYYY')}` },
        checked: redisIds.includes(punishment.redisId),
      })),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const punishments = await this.eligiblePunishments(req, res)
    if (!punishments.length) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    return this.renderView(req, res, punishments, {
      redisIds: punishments
        .filter(punishment => punishment.rehabilitativeActivities?.length)
        .map(punishment => punishment.redisId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const punishments = await this.eligiblePunishments(req, res)
    if (!punishments.length) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    const eligibleRedisIds = punishments.map(punishment => punishment.redisId)
    const redisIds = toArray(req.body.redisIds).filter(redisId => eligibleRedisIds.includes(redisId))

    const error = validateForm({ redisIds })
    if (error) {
      return this.renderView(req, res, punishments, { error, redisIds })
    }

    // unticking a punishment removes the activities it had
    punishments
      .filter(punishment => !redisIds.includes(punishment.redisId) && punishment.rehabilitativeActivities?.length)
      .forEach(punishment => this.punishmentsService.noRehabilitativeActivities(req, chargeNumber, punishment.redisId))

    // keep the order of the table, whatever order the form sent
    this.rehabBatchSessionService.start(
      req,
      chargeNumber,
      eligibleRedisIds.filter(redisId => redisIds.includes(redisId)),
    )
    if (redisIds.length > 1) {
      return res.redirect(adjudicationUrls.sameRehabilitativeActivity.urls.start(chargeNumber))
    }
    return res.redirect(this.rehabBatchSessionService.nextUrl(req, chargeNumber))
  }
}
