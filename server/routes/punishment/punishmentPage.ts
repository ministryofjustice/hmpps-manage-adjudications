/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import validateForm from './punishmentValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'
import PunishmentsService from '../../services/punishmentsService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'

type PageData = {
  error?: FormError
  punishmentType?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
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

export default class PunishmentPage {
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = pageData

    const lastHearing = await this.reportedAdjudicationsService.getLatestHearing(adjudicationNumber, user)
    const isIndependentAdjudicatorHearing = lastHearing.oicHearingType.includes('INAD')

    return res.render(`pages/punishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      errors: error ? [error] : [],
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      isIndependentAdjudicatorHearing,
      showAdditionalDaysOptions: config.addedDaysFlag === 'true',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(
        req,
        adjudicationNumber,
        req.params.redisId
      )

      return this.renderView(req, res, {
        punishmentType: sessionData.type,
        privilegeType: sessionData.privilegeType,
        otherPrivilege: sessionData.otherPrivilege,
        stoppagePercentage: sessionData.stoppagePercentage,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = req.body

    const stoppageOfEarningsPercentage = stoppagePercentage ? Number(String(stoppagePercentage).trim()) : null
    const error = validateForm({
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage: stoppageOfEarningsPercentage,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        punishmentType,
        privilegeType,
        otherPrivilege,
        stoppagePercentage: stoppageOfEarningsPercentage,
      })

    const redirectUrlPrefix = this.getRedirectUrl(adjudicationNumber, req)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { punishmentType, privilegeType, otherPrivilege, stoppagePercentage: stoppageOfEarningsPercentage },
      })
    )
  }

  private getRedirectUrl = (adjudicationNumber: number, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.punishmentSchedule.urls.edit(adjudicationNumber, req.params.redisId)
    }
    return adjudicationUrls.punishmentSchedule.urls.start(adjudicationNumber)
  }
}
