/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import validateForm from './punishmentValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrivilegeType, PunishmentDataWithSchedule, PunishmentType } from '../../data/PunishmentResult'
import PunishmentsService from '../../services/punishmentsService'

type PageData = {
  error?: FormError
  punishmentType?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  damagesOwedAmount?: number
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
    const { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage, damagesOwedAmount } = pageData

    const isIndependentAdjudicatorHearing = await this.punishmentsService.checkAdditionalDaysAvailability(
      chargeNumber,
      user
    )

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const [damagesUnavailable, punishmentsAlreadyAdded, cautionAlreadyAdded] = await Promise.all([
      this.damagesAlreadyAdded(sessionPunishments),
      this.punishmentsAlreadyAdded(sessionPunishments),
      this.cautionAlreadyAdded(sessionPunishments),
    ])

    return res.render(`pages/punishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      isIndependentAdjudicatorHearing,
      damagesUnavailable,
      cautionUnavailable: punishmentsAlreadyAdded || cautionAlreadyAdded,
      damagesOwedAmount,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)

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
    const { chargeNumber, redisId } = req.params
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, damagesOwedAmount } = req.body

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const damagesAlreadyAdded = await this.damagesAlreadyAdded(sessionPunishments)

    const stoppageOfEarningsPercentage = stoppagePercentage ? Number(String(stoppagePercentage).trim()) : null
    const error = validateForm({
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage: stoppageOfEarningsPercentage,
      damagesOwedAmount,
      damagesAlreadyAdded,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        punishmentType,
        privilegeType,
        otherPrivilege,
        stoppagePercentage: stoppageOfEarningsPercentage,
        damagesOwedAmount,
      })

    if ([PunishmentType.CAUTION, PunishmentType.DAMAGES_OWED].includes(punishmentType)) {
      const punishmentData = {
        type: punishmentType,
        days: 0,
        damagesOwedAmount,
      }
      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

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

  private damagesAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) => punishment.type === PunishmentType.DAMAGES_OWED
      ).length
    }
    return false
  }

  private punishmentsAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) =>
          punishment.type !== PunishmentType.CAUTION && punishment.type !== PunishmentType.DAMAGES_OWED
      ).length
    }
    return false
  }

  private cautionAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) => punishment.type === PunishmentType.CAUTION
      ).length
    }
    return false
  }
}
