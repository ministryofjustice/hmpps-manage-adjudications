/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { punishmentType } = req.query
    const type = PunishmentType[punishmentType as string]

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const possibleConsecutivePunishments = await this.punishmentsService.getPossibleConsecutivePunishments(
      adjudicationNumber,
      type,
      user
    )

    return res.render(`pages/whichPunishmentConsecutiveTo.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      manuallySelectConsecutivePunishment: this.getManualConsecutivePunishmentUrl(req, adjudicationNumber),
      possibleConsecutivePunishments,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]
    const { select } = req.body

    const chargeNumberOfSelectedPunishment = select.split('-').slice(-1)[0] || null
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: Number(days),
        consecutiveReportNumber: Number(chargeNumberOfSelectedPunishment),
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(
          req,
          punishmentData,
          adjudicationNumber,
          req.params.redisId
        )
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, adjudicationNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber)
      throw postError
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber))
  }

  private getPrefix = (adjudicationNumber: number, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit(adjudicationNumber, req.params.redisId)
    }
    return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(adjudicationNumber)
  }

  private getManualConsecutivePunishmentUrl = (req: Request, adjudicationNumber: number) => {
    const prefix = this.getPrefix(adjudicationNumber, req)
    return url.format({
      pathname: prefix,
      query: { ...(req.query as ParsedUrlQueryInput) },
    })
  }
}
