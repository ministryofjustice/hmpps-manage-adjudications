import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from '../../punishment/punishmentValidation'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  punishmentType?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  reportNumber?: number
}

export default class ManuallyActivateSuspendedPunishmentsPage {
  constructor(private readonly punishmentsService: PunishmentsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage, reportNumber } = pageData

    const isIndependentAdjudicatorHearing = await this.punishmentsService.checkAdditionalDaysAvailability(
      chargeNumber,
      user
    )

    return res.render(`pages/manuallyActivateSuspendedPunishment.njk`, {
      awardPunishmentsHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      reportNumber,
      isIndependentAdjudicatorHearing,
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
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, reportNumber } = req.body

    const reportNo = reportNumber ? Number(reportNumber.trim()) : null
    const stoppageOfEarnings = stoppagePercentage ? Number(stoppagePercentage.trim()) : null

    const error = this.validateInputs(reportNo, punishmentType, privilegeType, otherPrivilege, stoppageOfEarnings)

    if (error)
      return this.renderView(req, res, {
        error,
        punishmentType,
        privilegeType,
        otherPrivilege,
        stoppagePercentage: stoppageOfEarnings,
        reportNumber: reportNo,
      })

    const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req, punishmentType as PunishmentType)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, reportNo: reportNumber },
      })
    )
  }

  private getRedirectUrl = (chargeNumber: string, req: Request, punishmentType: PunishmentType) => {
    if ([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)) {
      return adjudicationUrls.numberOfAdditionalDays.urls.manualEdit(chargeNumber)
    }
    return adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manual(chargeNumber)
  }

  validateInputs = (
    reportNumber: number,
    punishmentType: PunishmentType,
    privilegeType: PrivilegeType,
    otherPrivilege: string,
    stoppagePercentage: number
  ) => {
    if (!reportNumber) {
      return {
        href: '#reportNumber',
        text: 'Enter charge number',
      }
    }
    const punishmentError = validateForm({ punishmentType, privilegeType, otherPrivilege, stoppagePercentage })
    if (punishmentError) return punishmentError
    return null
  }
}
