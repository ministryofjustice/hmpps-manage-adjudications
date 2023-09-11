/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { formatTimestampToDate, hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import validateForm from './startDateChoiceValidation'
import { User } from '../../../data/hmppsManageUsersClient'

type PageData = {
  error?: FormError
  immediate?: string
  lastHearingDate?: string
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

export default class PunishmentStartDateChoicePage {
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
    const { user } = res.locals
    const { error, immediate } = pageData

    const lastHearingDate = await this.getLastHearingDate(chargeNumber, user)
    return res.render(`pages/punishmentStartDateChoice.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      immediate,
      lastHearingDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const lastHearingDate = formatTimestampToDate(await this.getLastHearingDate(chargeNumber, user))
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)
      return this.renderView(req, res, {
        immediate: sessionData.startDate === lastHearingDate ? 'true' : 'false',
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { immediate } = req.body
    const { user } = res.locals
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query

    const error = validateForm({
      immediate,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        immediate,
      })

    let lastHearingDate = null
    if (immediate === 'true') {
      const lastHearingDateTime = await this.getLastHearingDate(chargeNumber, user)
      lastHearingDate = formatTimestampToDate(lastHearingDateTime)
    }

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req, immediate)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: {
          punishmentType,
          privilegeType,
          otherPrivilege,
          stoppagePercentage,
          days,
          startDate: lastHearingDate,
        } as ParsedUrlQueryInput,
      })
    )
  }

  getRedirectUrl = (chargeNumber: string, req: Request, immediate: string) => {
    if (this.pageOptions.isEdit()) {
      if (immediate === 'true') return adjudicationUrls.punishmentAutomaticDateSchedule.urls.start(chargeNumber)
      return adjudicationUrls.punishmentStartDate.urls.edit(chargeNumber, req.params.redisId)
    }
    if (immediate === 'true') return adjudicationUrls.punishmentAutomaticDateSchedule.urls.start(chargeNumber)
    return adjudicationUrls.punishmentStartDate.urls.start(chargeNumber)
  }

  getLastHearingDate = async (chargeNumber: string, user: User) => {
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
      user
    )
    return reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing || ''
  }
}
