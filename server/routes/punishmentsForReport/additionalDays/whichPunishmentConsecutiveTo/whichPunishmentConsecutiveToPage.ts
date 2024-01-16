/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

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
    const type = PunishmentType[punishmentType as string]

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
      manuallySelectConsecutivePunishment: this.getManualConsecutivePunishmentUrl(req, chargeNumber),
      possibleConsecutivePunishments,
      hideManualLink: config.hideManualActionsFlag === 'true',
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]
    const { select } = req.body

    // We're grabbing the value of the button clicked, which has `consecutive-report-` before the charge number, so we need to strip that out first
    const chargeNumberOfSelectedPunishment = select.replace('consecutive-report-', '') || null
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: Number(days),
        consecutiveChargeNumber: chargeNumberOfSelectedPunishment,
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

  private getPrefix = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(chargeNumber)
  }

  private getManualConsecutivePunishmentUrl = (req: Request, chargeNumber: string) => {
    const prefix = this.getPrefix(chargeNumber, req)
    return url.format({
      pathname: prefix,
      query: { ...(req.query as ParsedUrlQueryInput) },
    })
  }
}
