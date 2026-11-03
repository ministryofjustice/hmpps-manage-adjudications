import type { Request, Response } from 'express'
import type { FormError } from '../../../../@types/template'
import type PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import type { PunishmentData } from '../../../../data/PunishmentResult'
import {
  canHaveRehabilitativeActivity,
  convertPunishmentType,
  hasRehabilitativeActivities,
} from '../../../../data/PunishmentResult'
import { formatTimestampTo } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm from './whichPunishmentsValidation'

type PageData = {
  error?: FormError
  redisIds?: string[]
}

const punishmentName = (punishment: PunishmentData): string =>
  convertPunishmentType(
    punishment.type,
    punishment.stoppagePercentage,
    punishment.privilegeType,
    punishment.otherPrivilege,
  )

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

  // A punishment that already has a condition is left off the list: it is changed or removed on the award
  // punishments page. One in the batch being answered stays on, so coming back part way through shows the choice.
  private availablePunishments = (req: Request, punishments: PunishmentData[]): PunishmentData[] => {
    const { chargeNumber } = req.params
    return punishments.filter(
      punishment =>
        !hasRehabilitativeActivities(punishment) ||
        this.rehabBatchSessionService.includes(req, chargeNumber, punishment.redisId),
    )
  }

  private renderView = async (
    req: Request,
    res: Response,
    punishments: PunishmentData[],
    available: PunishmentData[],
    pageData: PageData,
  ): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, redisIds } = pageData

    return res.render(`pages/whichPunishmentsHaveRehabilitativeActivities.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      alreadyAdded: punishments.filter(punishment => !available.includes(punishment)).map(punishmentName),
      items: available.map(punishment => ({
        value: punishment.redisId,
        text: punishmentName(punishment),
        hint: { text: `Suspended until ${formatTimestampTo(punishment.suspendedUntil, 'D MMMM YYYY')}` },
        checked: redisIds.includes(punishment.redisId),
      })),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const punishments = await this.eligiblePunishments(req, res)
    const available = this.availablePunishments(req, punishments)
    if (!available.length) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    // coming back to this page part way through shows what was ticked
    return this.renderView(req, res, punishments, available, {
      redisIds: this.rehabBatchSessionService.get(req, chargeNumber)?.redisIds ?? [],
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const punishments = await this.eligiblePunishments(req, res)
    const available = this.availablePunishments(req, punishments)
    if (!available.length) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    const availableRedisIds = available.map(punishment => punishment.redisId)
    const redisIds = toArray(req.body.redisIds).filter(redisId => availableRedisIds.includes(redisId))

    const error = validateForm({ redisIds })
    if (error) {
      return this.renderView(req, res, punishments, available, { error, redisIds })
    }

    // Unticking takes nothing away: a condition is removed on the award punishments page.
    // Keep the order of the table, whatever order the form sent.
    this.rehabBatchSessionService.start(
      req,
      chargeNumber,
      availableRedisIds.filter(redisId => redisIds.includes(redisId)),
    )
    if (redisIds.length > 1) {
      return res.redirect(adjudicationUrls.sameRehabilitativeActivity.urls.start(chargeNumber))
    }
    return res.redirect(this.rehabBatchSessionService.nextUrl(req, chargeNumber))
  }
}
