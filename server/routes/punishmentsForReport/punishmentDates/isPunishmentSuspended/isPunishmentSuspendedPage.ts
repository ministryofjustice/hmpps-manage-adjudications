/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import validateForm from './isPunishmentSuspendedValidation'

type PageData = {
  error?: FormError
  suspended?: string
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

export default class PunishmentSuspendedPage {
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
    const { error, suspended } = pageData

    return res.render(`pages/punishmentIsSuspended.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      suspended,
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
        suspended: sessionData.suspendedUntil ? 'yes' : 'no',
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { suspended } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, duration } = req.query

    const error = validateForm({
      suspended,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        suspended,
      })

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req, suspended)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: {
          punishmentType,
          privilegeType,
          otherPrivilege,
          stoppagePercentage,
          duration,
        } as ParsedUrlQueryInput,
      })
    )
  }

  getRedirectUrl = (chargeNumber: string, req: Request, suspended: string) => {
    if (this.pageOptions.isEdit()) {
      if (suspended === 'yes')
        return adjudicationUrls.punishmentSuspendedUntil.urls.edit(chargeNumber, req.params.redisId)
      return adjudicationUrls.punishmentStartDate.urls.edit(chargeNumber, req.params.redisId)
    }
    if (suspended === 'yes') return adjudicationUrls.punishmentSuspendedUntil.urls.start(chargeNumber)
    return adjudicationUrls.whenWillPunishmentStart.urls.start(chargeNumber)
  }
}
