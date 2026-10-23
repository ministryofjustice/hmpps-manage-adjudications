import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentData, convertPunishmentType } from '../../../../data/PunishmentResult'
import { formatTimestampTo, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'

export default class RehabilitativeActivitiesSchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  // The punishments in the open rehab batch, in the order they were ticked
  private batchPunishments = (req: Request, chargeNumber: string): PunishmentData[] =>
    (this.punishmentsService.getRehabBatch(req, chargeNumber)?.redisIds || [])
      .map(redisId => this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId))
      .filter((punishment: PunishmentData) => punishment?.rehabilitativeActivities?.length)

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const punishments = this.batchPunishments(req, chargeNumber)
    if (!punishments.length) return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))

    const activities = punishments.flatMap(punishment => {
      const name = convertPunishmentType(
        punishment.type,
        punishment.stoppagePercentage,
        punishment.privilegeType,
        punishment.otherPrivilege,
      )
      const extended = this.punishmentsService.extendRehabActivities([punishment], chargeNumber)
      return extended.map((activity, i) => ({
        heading: extended.length > 1 ? `${name}: activity ${i + 1} of ${extended.length}` : null,
        punishmentName: name,
        details: activity.details,
        monitor: activity.monitor,
        endDate: formatTimestampTo(activity.endDate, 'D MMMM YYYY'),
        totalSessions: activity.totalSessions,
        changeHref: activity.changeUrl,
      }))
    })

    return res.render(`pages/rehabilitativeActivitiesSchedule.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      whichPunishmentsHref: adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start(chargeNumber),
      activities,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    if (this.batchPunishments(req, chargeNumber).length) {
      this.punishmentsService.setSuccessMessage(req, chargeNumber, 'Rehabilitative activity added')
    }
    this.punishmentsService.clearRehabBatch(req, chargeNumber)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
