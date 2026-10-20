import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentData, convertPunishmentType, isSocialVisitsPunishment } from '../../../../data/PunishmentResult'
import { formatTimestampTo, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'

const punishmentName = (punishment: PunishmentData) =>
  convertPunishmentType(
    punishment.type,
    punishment.stoppagePercentage,
    punishment.privilegeType,
    punishment.otherPrivilege,
  )

export default class SchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  // The session punishments the open batch has added, in the order they were chosen
  private batchPunishments = (req: Request, chargeNumber: string): PunishmentData[] =>
    (this.punishmentsService.getPunishmentBatch(req, chargeNumber)?.items || [])
      .filter(item => item.redisId)
      .map(item => this.punishmentsService.getSessionPunishment(req, chargeNumber, item.redisId))
      .filter(Boolean)

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const punishments = this.batchPunishments(req, chargeNumber)
    if (!punishments.length) return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))

    return res.render(`pages/punishmentSchedule.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      punishments: punishments.map(punishment => ({
        name: punishmentName(punishment),
        startDate: formatTimestampTo(punishment.startDate, 'D MMMM YYYY'),
        endDate: formatTimestampTo(punishment.endDate, 'D MMMM YYYY'),
        suspendedUntil: formatTimestampTo(punishment.suspendedUntil, 'D MMMM YYYY'),
        duration: punishment.duration,
        showChildrenUnder18: isSocialVisitsPunishment(punishment.type),
        hasChildUnder18: punishment.hasChildUnder18,
        changeHref: adjudicationUrls.punishmentDuration.urls.edit(chargeNumber, punishment.redisId),
      })),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const punishments = this.batchPunishments(req, chargeNumber)
    if (punishments.length) {
      this.punishmentsService.setSuccessMessage(
        req,
        chargeNumber,
        punishments.length === 1
          ? `${punishmentName(punishments[0])} added`
          : `${punishments.length} punishments added`,
      )
    }
    this.punishmentsService.clearPunishmentBatch(req, chargeNumber)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
