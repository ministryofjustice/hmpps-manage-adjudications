import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  details?: string
  monitorName?: string
  endDate?: string
  totalSessions?: number
  type?: PunishmentType
  stoppagePercentage?: number
  privilegeType?: PrivilegeType
  otherPrivilege?: string
}

export default class RemoveRehabilitativeActivityPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { details, monitorName, endDate, totalSessions, type, stoppagePercentage, privilegeType, otherPrivilege } =
      pageData

    return res.render(`pages/removeRehabilitativeActivity.njk`, {
      cancelLinkURL: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      details,
      monitorName,
      endDate,
      totalSessions,
      type,
      stoppagePercentage,
      privilegeType,
      otherPrivilege,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId, id } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const rehabActivity = await this.punishmentsService.getRehabActivity(req, chargeNumber, redisId, +id)

    return this.renderView(req, res, {
      details: rehabActivity.details,
      monitorName: rehabActivity.monitor,
      endDate: rehabActivity.endDate,
      totalSessions: rehabActivity.totalSessions,
      type: rehabActivity.type,
      stoppagePercentage: rehabActivity.stoppagePercentage,
      privilegeType: rehabActivity.privilegeType,
      otherPrivilege: rehabActivity.otherPrivilege,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId, id } = req.params

    await this.punishmentsService.removeRehabilitativeActivity(req, chargeNumber, redisId, +id)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
