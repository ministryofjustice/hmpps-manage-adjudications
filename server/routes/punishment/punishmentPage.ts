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
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = pageData

    const isIndependentAdjudicatorHearing = await this.punishmentsService.checkAdditionalDaysAvailability(
      chargeNumber,
      user
    )

    return res.render(`pages/punishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
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
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)

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
    const { chargeNumber } = req.params
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

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req, punishmentType as PunishmentType)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { punishmentType, privilegeType, otherPrivilege, stoppagePercentage: stoppageOfEarningsPercentage },
      })
    )
  }

  private getRedirectUrl = (chargeNumber: string, req: Request, punishmentType: PunishmentType) => {
    if ([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)) {
      if (this.pageOptions.isEdit()) {
        return adjudicationUrls.numberOfAdditionalDays.urls.edit(chargeNumber, req.params.redisId)
      }
      return adjudicationUrls.numberOfAdditionalDays.urls.start(chargeNumber)
    }
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.punishmentSchedule.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.punishmentSchedule.urls.start(chargeNumber)
  }
}
