/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import validateForm from './numberOfAdditionalDaysValidation'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { User } from '../../../../data/hmppsManageUsersClient'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  duration?: number
}

export enum PageRequestType {
  CREATION,
  EDIT,
  MANUAL_EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }

  isManualEdit(): boolean {
    return this.pageType === PageRequestType.MANUAL_EDIT
  }
}

export default class NumberOfAdditionalDaysPage {
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
    const { error, duration } = pageData

    return res.render(`pages/numberOfAdditionalDays.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      duration,
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
        duration: sessionData.duration,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { duration } = req.body
    const { punishmentType, privilegeType } = req.query
    const type = PunishmentType[punishmentType as keyof typeof PunishmentType]

    const trimmedDays = duration ? Number(String(duration).trim()) : null

    const isYOI = await this.getYoiInfo(chargeNumber, user)
    const error = validateForm({
      duration: trimmedDays,
      punishmentType: type,
      isYOI,
      privilegeType: privilegeType ? PrivilegeType[privilegeType as keyof typeof PrivilegeType] : null,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        duration,
      })

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { ...req.query, duration: trimmedDays },
      })
    )
  }

  private getRedirectUrl = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.start(chargeNumber)
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }
}
