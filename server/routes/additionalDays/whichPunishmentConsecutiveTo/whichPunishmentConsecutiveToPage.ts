/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../services/userService'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { apiDateToDatePicker, datePickerToApi, hasAnyRole } from '../../../utils/utils'
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

    const possibleConsecutivePunishments = this.punishmentsService.getPossibleConsecutivePunishments(
      adjudicationNumber,
      type,
      user
    )

    return res.render(`pages/whichPunishmentConsecutiveTo.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      manuallySelectConsecutivePunishment: '#',
      possibleConsecutivePunishments,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]
    const { consecutiveReportNumber } = req.body

    // submit buttons add to session - requires charge number of the punishment chosen (get it from submit button id?)
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: Number(days),
        consecutiveReportNumber: Number(consecutiveReportNumber),
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
}
