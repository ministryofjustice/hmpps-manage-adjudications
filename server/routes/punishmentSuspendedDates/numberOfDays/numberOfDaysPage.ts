/* eslint-disable max-classes-per-file */
import url from 'url'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import {
  PrivilegeType,
  PunishmentData,
  PunishmentType,
  SuspendedPunishment,
  flattenPunishment,
} from '../../../data/PunishmentResult'
import { User } from '../../../data/hmppsManageUsersClient'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import validateForm from './numberOfDaysValidation'

type PageData = {
  error?: FormError
  days?: number
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

export default class SuspendedPunishmentNumberOfDaysPage {
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
      errors: error ? [error] : [],
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      days,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { days } = req.query
    let punishmentDays = null
    if (days != null) {
      punishmentDays = Number(days)
    }

    return this.renderView(req, res, { days: punishmentDays })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { days } = req.body
    const { punishmentNumberToActivate, punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = req.query
    const type = PunishmentType[punishmentType as string]
    const trimmedDays = days ? Number(String(days).trim()) : null
    const isYOI = await this.getYoiInfo(chargeNumber, user)

    const isTypeAdditionalDays = [PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(
      punishmentType as PunishmentType
    )

    const error = validateForm({
      days,
      punishmentType: type,
      isYOI,
      privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
    })

    if (error) return this.renderView(req, res, { error, days })

    if (isTypeAdditionalDays) {
      try {
        const { suspendedPunishments } = await this.punishmentsService.getSuspendedPunishmentDetails(chargeNumber, user)
        const punishmentToUpdate = suspendedPunishments.filter(susPun => {
          return susPun.punishment.id === Number(punishmentNumberToActivate)
        })

        if (punishmentToUpdate.length) {
          const { punishment } = punishmentToUpdate[0]
          const activatedFromChargeNumber = punishmentToUpdate[0].chargeNumber
          const updatedPunishment = this.updatePunishment(punishment, days, activatedFromChargeNumber)
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
        res.locals.redirectUrl = adjudicationUrls.activateSuspendedPunishments.urls.start(chargeNumber)
        throw postError
      }
    }

    const nextPage = await this.getRedirectUrl(req, isTypeAdditionalDays, chargeNumber)
    return res.redirect(
      url.format({
        pathname: nextPage,
        query: {
          punishmentType,
          privilegeType,
          otherPrivilege,
          stoppagePercentage,
          days: trimmedDays,
          punishmentNumberToActivate,
        } as ParsedUrlQueryInput,
      })
    )
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }

  getRedirectUrl = (req: Request, isTypeAdditionalDays: boolean, chargeNumber: string) => {
    if (isTypeAdditionalDays) return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.suspendedPunishmentStartDateChoice.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.suspendedPunishmentStartDateChoice.urls.existing(chargeNumber)
  }

  updatePunishment(
    existingPunishment: SuspendedPunishment,
    days: number,
    activatedFromChargeNumber: string
  ): PunishmentData {
    const activePunishment = {
      ...existingPunishment,
      redisId: uuidv4(),
      activatedFrom: activatedFromChargeNumber,
      schedule: {
        days,
        suspendedUntil: null as never,
        startDate: null as never,
        endDate: null as never,
      },
    }

    return flattenPunishment(activePunishment)
  }
}
