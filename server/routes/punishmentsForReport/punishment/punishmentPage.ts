/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import validateForm from './punishmentValidation'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import {
  PrivilegeType,
  PunishmentBatchItem,
  PunishmentDataWithSchedule,
  PunishmentType,
  RehabilitativeActivity,
  isDayBasedPunishment,
  isSocialVisitsPunishment,
  parseHasChildUnder18,
} from '../../../data/PunishmentResult'
import PunishmentsService from '../../../services/punishmentsService'

type PageData = {
  error?: FormError
  punishmentType?: PunishmentType
  privilegeType?: PrivilegeType
  privilegeTypes?: PrivilegeType[]
  otherPrivilege?: string
  stoppagePercentage?: number
  damagesOwedAmount?: number
  hasChildUnder18?: boolean
}

const toArray = <T>(value: T | T[]): T[] => {
  if (value === undefined || value === null || value === '') return []
  return Array.isArray(value) ? value : [value]
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
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const {
      error,
      punishmentType,
      privilegeType,
      privilegeTypes,
      otherPrivilege,
      stoppagePercentage,
      damagesOwedAmount,
      hasChildUnder18,
    } = pageData

    const [punishmentAvailability, sessionPunishments] = await Promise.all([
      this.punishmentsService.getPunishmentAvailability(chargeNumber, user),
      this.punishmentsService.getAllSessionPunishments(req, chargeNumber),
    ])
    const { isIndependentAdjudicatorHearing, isAdult } = punishmentAvailability
    const [damagesAlreadyAdded, punishmentsAlreadyAdded, cautionAlreadyAdded] = await Promise.all([
      this.damagesAlreadyAdded(sessionPunishments),
      this.punishmentsAlreadyAdded(sessionPunishments),
      this.cautionAlreadyAdded(sessionPunishments),
    ])

    const punishmentsAvailable = {
      addedDays: isIndependentAdjudicatorHearing,
      caution: !(punishmentsAlreadyAdded || cautionAlreadyAdded),
      damages: !damagesAlreadyAdded,
      extraWork: !isAdult,
      removalFromActivity: !isAdult,
      socialVisits: isAdult,
    }

    return res.render(`pages/punishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      punishmentsAvailable,
      punishmentType,
      privilegeType,
      multiplePrivileges: this.isMultiplePrivileges(res),
      privilegeTypes: privilegeTypes || [],
      privilegesAlreadyAdded: this.privilegesAlreadyAdded(sessionPunishments),
      otherPrivilege,
      stoppagePercentage,
      damagesOwedAmount,
      hasChildUnder18,
      isAdult,
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
        hasChildUnder18: sessionData.hasChildUnder18,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const {
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      damagesOwedAmount,
      lossHasChildUnder18,
      restrictionHasChildUnder18,
      action,
    } = req.body
    const multiplePrivileges = this.isMultiplePrivileges(res)
    // Save and exit is shown whenever the toggle is on, including when changing a punishment
    if (res.locals.featureToggles?.multiPrivilegePunishments && action === 'exit') {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    const privilegeTypes = multiplePrivileges ? toArray<PrivilegeType>(req.body.privilegeTypes) : []
    const hasChildUnder18 = parseHasChildUnder18(
      punishmentType === PunishmentType.LOSS_OF_SOCIAL_VISITS ? lossHasChildUnder18 : restrictionHasChildUnder18,
    )

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const damagesAlreadyAdded = await this.damagesAlreadyAdded(sessionPunishments)

    const stoppageOfEarningsPercentage = stoppagePercentage ? Number(String(stoppagePercentage).trim()) : null
    const error = validateForm({
      punishmentType,
      privilegeType,
      privilegeTypes,
      multiplePrivileges,
      otherPrivilege,
      stoppagePercentage: stoppageOfEarningsPercentage,
      damagesOwedAmount,
      damagesAlreadyAdded,
      // also checked here, as a form from another tab or the browser history can still offer them
      privilegesAlreadyAdded: multiplePrivileges ? this.privilegesAlreadyAdded(sessionPunishments) : [],
      hasChildUnder18,
    })
    if (error)
      return this.renderView(req, res, {
        error,
        punishmentType,
        privilegeType,
        privilegeTypes,
        otherPrivilege,
        stoppagePercentage: stoppageOfEarningsPercentage,
        damagesOwedAmount,
        hasChildUnder18,
      })

    if ([PunishmentType.CAUTION, PunishmentType.DAMAGES_OWED].includes(punishmentType)) {
      const punishmentData = {
        type: punishmentType,
        duration: 0,
        damagesOwedAmount,
        rehabilitativeActivities: [] as RehabilitativeActivity[],
      }
      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    if (res.locals.featureToggles?.multiPrivilegePunishments && isDayBasedPunishment(punishmentType)) {
      return this.startDurationJourney(req, res, {
        punishmentType,
        privilegeType,
        privilegeTypes,
        otherPrivilege,
        stoppagePercentage: stoppageOfEarningsPercentage,
        hasChildUnder18,
      })
    }

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req, punishmentType as PunishmentType)
    const query = this.getQueryParamsToPass(
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppageOfEarningsPercentage,
      hasChildUnder18,
    )
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query,
      }),
    )
  }

  // Day-based punishments go to the combined duration and start date page (IR-1904).
  // A new loss of privileges becomes one batch item per privilege ticked; anything else is a batch of one.
  private startDurationJourney = (req: Request, res: Response, pageData: PageData) => {
    const { chargeNumber, redisId } = req.params
    const { punishmentType, privilegeType, privilegeTypes, otherPrivilege, stoppagePercentage, hasChildUnder18 } =
      pageData
    const typeDetails = (privilege?: PrivilegeType): PunishmentBatchItem => ({
      type: punishmentType,
      ...(privilege && { privilegeType: privilege }),
      ...(privilege === PrivilegeType.OTHER && { otherPrivilege: otherPrivilege.trim() }),
      ...(punishmentType === PunishmentType.EARNINGS && { stoppagePercentage }),
      ...(isSocialVisitsPunishment(punishmentType) && { hasChildUnder18 }),
    })

    if (this.pageOptions.isEdit()) {
      const { type, ...details } = typeDetails(punishmentType === PunishmentType.PRIVILEGE ? privilegeType : undefined)
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.punishmentDuration.urls.edit(chargeNumber, redisId),
          query: { punishmentType: type, ...details },
        }),
      )
    }

    const items =
      punishmentType === PunishmentType.PRIVILEGE
        ? Object.values(PrivilegeType)
            .filter(privilege => privilegeTypes.includes(privilege))
            .map(privilege => typeDetails(privilege))
        : [typeDetails()]
    this.punishmentsService.startPunishmentBatch(req, chargeNumber, items)
    if (items.length > 1) return res.redirect(adjudicationUrls.punishmentSameDuration.urls.start(chargeNumber))
    return res.redirect(adjudicationUrls.punishmentDuration.urls.start(chargeNumber))
  }

  // Edit mode keeps the single-choice radios: one punishment cannot be changed into several
  private isMultiplePrivileges = (res: Response): boolean =>
    !!res.locals.featureToggles?.multiPrivilegePunishments && !this.pageOptions.isEdit()

  private getQueryParamsToPass = (
    punishmentType: PunishmentType,
    privilegeType: PrivilegeType,
    otherPrivilege: string,
    stoppageOfEarningsPercentage: number,
    hasChildUnder18?: boolean,
  ) => {
    if (isSocialVisitsPunishment(punishmentType)) return { punishmentType, hasChildUnder18 }
    if (this.pageOptions.isEdit()) {
      if (punishmentType === PunishmentType.PRIVILEGE && privilegeType === PrivilegeType.OTHER)
        return { punishmentType, privilegeType, otherPrivilege }
      if (punishmentType === PunishmentType.PRIVILEGE) return { punishmentType, privilegeType }
      if (punishmentType === PunishmentType.EARNINGS)
        return { punishmentType, stoppagePercentage: stoppageOfEarningsPercentage }
      return { punishmentType }
    }
    return { punishmentType, privilegeType, otherPrivilege, stoppagePercentage: stoppageOfEarningsPercentage }
  }

  private getRedirectUrl = (chargeNumber: string, req: Request, punishmentType: PunishmentType) => {
    if ([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)) {
      if (this.pageOptions.isEdit()) {
        return adjudicationUrls.numberOfAdditionalDays.urls.edit(chargeNumber, req.params.redisId)
      }
      return adjudicationUrls.numberOfAdditionalDays.urls.start(chargeNumber)
    }

    if (this.pageOptions.isEdit()) {
      if (punishmentType === PunishmentType.PAYBACK)
        return adjudicationUrls.paybackPunishmentSpecifics.urls.edit(chargeNumber, req.params.redisId)
      return adjudicationUrls.punishmentNumberOfDays.urls.edit(chargeNumber, req.params.redisId)
    }
    if (punishmentType === PunishmentType.PAYBACK)
      return adjudicationUrls.paybackPunishmentSpecifics.urls.start(chargeNumber)
    return adjudicationUrls.punishmentNumberOfDays.urls.start(chargeNumber)
  }

  private privilegesAlreadyAdded = (sessionPunishments: PunishmentDataWithSchedule[]): PrivilegeType[] =>
    (sessionPunishments || [])
      .filter((punishment: PunishmentDataWithSchedule) => punishment.type === PunishmentType.PRIVILEGE)
      .map((punishment: PunishmentDataWithSchedule) => punishment.privilegeType)

  private damagesAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) => punishment.type === PunishmentType.DAMAGES_OWED,
      ).length
    }
    return false
  }

  private punishmentsAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) =>
          punishment.type !== PunishmentType.CAUTION && punishment.type !== PunishmentType.DAMAGES_OWED,
      ).length
    }
    return false
  }

  private cautionAlreadyAdded = async (sessionPunishments: PunishmentDataWithSchedule[]) => {
    if (sessionPunishments) {
      return !!sessionPunishments.filter(
        (punishment: PunishmentDataWithSchedule) => punishment.type === PunishmentType.CAUTION,
      ).length
    }
    return false
  }
}
