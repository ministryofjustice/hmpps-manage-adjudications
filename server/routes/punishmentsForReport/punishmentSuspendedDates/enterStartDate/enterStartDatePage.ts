/* eslint-disable max-classes-per-file */
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole, datePickerToApi, calculatePunishmentEndDate } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import validateForm from './enterStartDateValidation'
import {
  PrivilegeType,
  PunishmentData,
  PunishmentType,
  SuspendedPunishment,
  flattenPunishment,
} from '../../../../data/PunishmentResult'
import { User } from '../../../../data/hmppsManageUsersClient'

type PageData = {
  error?: FormError
  startDate?: string
}

export enum PageRequestType {
  EXISTING,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isExistingOrExistingEdit(): boolean {
    return this.pageType === PageRequestType.EXISTING || this.pageType === PageRequestType.EDIT
  }

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class PunishmentSuspendedStartDatePage {
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
    const { error, startDate } = pageData

    return res.render(`pages/punishmentStartDate.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      startDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { startDate } = req.body
    const { punishmentType, privilegeType, duration, punishmentNumberToActivate } = req.query

    const type = PunishmentType[punishmentType as string]
    const numberOfDays = Number(duration)
    const suspendedPunishmentIdToActivate = Number(punishmentNumberToActivate)

    const isYOI = await this.getYoiInfo(chargeNumber, user)

    const error = validateForm({
      startDate,
      isYOI,
      punishmentType: type,
      privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
      duration: Number(duration),
    })

    if (error)
      return this.renderView(req, res, {
        error,
        startDate,
      })

    try {
      if (this.pageOptions.isExistingOrExistingEdit()) {
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
            startDate,
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
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }
    const redirectUrl = this.getRedirectUrl(chargeNumber)
    return res.redirect(redirectUrl)
  }

  getRedirectUrl = (chargeNumber: string) => {
    return adjudicationUrls.suspendedPunishmentAutoDates.urls.existing(chargeNumber)
  }

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }

  updatePunishment(
    existingPunishment: SuspendedPunishment,
    duration: number,
    startDate: string,
    activatedFromChargeNumber: string
  ): PunishmentData {
    const activePunishment = {
      ...existingPunishment,
      redisId: uuidv4(),
      activatedFrom: activatedFromChargeNumber,
      schedule: {
        duration,
        startDate: startDate ? datePickerToApi(startDate) : null,
        endDate: calculatePunishmentEndDate(startDate, duration, 'YYYY-MM-DD'),
        suspendedUntil: null as never,
      },
    }
    return flattenPunishment(activePunishment)
  }
}
