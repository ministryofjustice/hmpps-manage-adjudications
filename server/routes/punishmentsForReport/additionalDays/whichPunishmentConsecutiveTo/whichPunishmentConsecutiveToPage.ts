/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'

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

export default class WhichPunishmentConsecutiveToPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const { chargeNumber } = req.params
    const { punishmentType } = req.query
    const type = PunishmentType[punishmentType as keyof typeof PunishmentType]

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const possibleConsecutivePunishments = await this.punishmentsService.getPossibleConsecutivePunishments(
      chargeNumber,
      type,
      user
    )

    return res.render(`pages/whichPunishmentConsecutiveTo.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      possibleConsecutivePunishments,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, duration } = req.query
    const type = PunishmentType[punishmentType as keyof typeof PunishmentType]
    const { select } = req.body

    // We're grabbing the value of the button clicked, which has `consecutive-report-` before the charge number, so we need to strip that out first
    const chargeNumberOfSelectedPunishment = select.replace('consecutive-report-', '') || null
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as keyof typeof PrivilegeType] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        duration: Number(duration),
        consecutiveChargeNumber: chargeNumberOfSelectedPunishment,
        rehabilitativeActivities: [] as RehabilitativeActivity[],
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, req.params.redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
      throw postError
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
