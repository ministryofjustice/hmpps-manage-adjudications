/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import { User } from '../../../../data/hmppsManageUsersClient'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import validateForm from './numberOfDaysValidation'

type PageData = {
  error?: FormError
  days?: number
}

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

export default class PunishmentNumberOfDaysPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, days } = pageData

    return res.render(`pages/punishmentNumberOfDays.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      days,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)
      return this.renderView(req, res, {
        days: sessionData.days,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { days } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = req.query
    const type = PunishmentType[punishmentType as string]

    const trimmedDays = days ? Number(String(days).trim()) : null

    const isYOI = await this.getYoiInfo(chargeNumber, user)
    const error = validateForm({
      days: trimmedDays,
      punishmentType: type,
      isYOI,
      privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        days: trimmedDays,
      })

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: {
          punishmentType,
          privilegeType,
          otherPrivilege,
          stoppagePercentage,
          days: trimmedDays,
        } as ParsedUrlQueryInput,
      })
    )
  }

  getRedirectUrl = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.punishmentIsSuspended.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.punishmentIsSuspended.urls.start(chargeNumber)
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }
}
