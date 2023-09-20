/* eslint-disable max-classes-per-file */
import url from 'url'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { calculatePunishmentEndDate, datePickerToApi, formatTimestampToDate, hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import validateForm from './startDateChoiceValidation'
import { User } from '../../../data/hmppsManageUsersClient'
import {
  PrivilegeType,
  PunishmentData,
  PunishmentType,
  SuspendedPunishment,
  flattenPunishment,
} from '../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  immediate?: string
  lastHearingDate?: string
}

export enum PageRequestType {
  EXISTING,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class PunishmentSuspendedStartDateChoicePage {
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
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { immediate } = req.body
    const { user } = res.locals
    const { punishmentNumberToActivate, punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } =
      req.query
    const suspendedPunishmentIdToActivate = Number(punishmentNumberToActivate)

    const isYOI = await this.getYoiInfo(chargeNumber, user)
    const error = validateForm({
      immediate,
      isYOI,
      punishmentType: punishmentType ? PunishmentType[punishmentType as string] : null,
      privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
      days: Number(days),
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
      const numberOfDays = Number(days)
      try {
        const { suspendedPunishments } = await this.punishmentsService.getSuspendedPunishmentDetails(chargeNumber, user)
        const punishmentToUpdate = suspendedPunishments.filter(susPun => {
          return susPun.punishment.id === suspendedPunishmentIdToActivate
        })

        if (punishmentToUpdate.length) {
          const { punishment } = punishmentToUpdate[0]
          const activatedFromChargeNumber = punishmentToUpdate[0].chargeNumber
          const updatedPunishment = this.updatePunishment(
            punishment,
            numberOfDays,
            lastHearingDate,
            activatedFromChargeNumber
          )
          if (this.pageOptions.isEdit()) {
            await this.punishmentsService.updateSessionPunishment(
              req,
              updatedPunishment,
              chargeNumber,
              req.params.redisId
            )
          } else {
            await this.punishmentsService.addSessionPunishment(req, updatedPunishment, chargeNumber)
          }
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
        throw postError
      }
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
          punishmentNumberToActivate,
        } as ParsedUrlQueryInput,
      })
    )
  }

  getRedirectUrl = (chargeNumber: string, req: Request, immediate: string) => {
    if (immediate === 'true') {
      return adjudicationUrls.suspendedPunishmentAutoDates.urls.existing(chargeNumber)
    }
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.suspendedPunishmentStartDate.urls.edit(chargeNumber, req.params.redisId)
    }

    return adjudicationUrls.suspendedPunishmentStartDate.urls.existing(chargeNumber)
  }

  getLastHearingDate = async (chargeNumber: string, user: User) => {
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
      user
    )
    return reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing || ''
  }

  updatePunishment(
    existingPunishment: SuspendedPunishment,
    days: number,
    startDate: string,
    activatedFromChargeNumber: string
  ): PunishmentData {
    const activePunishment = {
      ...existingPunishment,
      redisId: uuidv4(),
      activatedFrom: activatedFromChargeNumber,
      schedule: {
        days,
        startDate: startDate ? datePickerToApi(startDate) : null,
        endDate: calculatePunishmentEndDate(startDate, days, 'YYYY-MM-DD'),
        suspendedUntil: null as never,
      },
    }
    return flattenPunishment(activePunishment)
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }
}
