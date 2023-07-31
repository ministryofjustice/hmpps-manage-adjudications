/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import validateForm from './willPunishmentBeConsecutiveValidation'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  prisonerName?: string
  consecutive?: string
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

export default class WillPunishmentBeConsecutivePage {
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
    const { error, consecutive } = pageData

    const prisoner = await this.punishmentsService.getPrisonerDetails(chargeNumber, user)

    return res.render(`pages/willPunishmentBeConsecutive.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      prisonerName: prisoner.friendlyName || 'this prisoner',
      consecutive,
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
        consecutive: sessionData.consecutiveReportNumber ? 'yes' : 'no',
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { consecutive } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]

    const error = validateForm({
      consecutive,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        consecutive,
      })

    //   If the punishment is consecutive, redirect to the page where they can choose the other punishment, where the save will occur
    if (consecutive === 'yes') {
      const redirectUrlPrefix = this.getRedirectUrl(chargeNumber, req)
      return res.redirect(
        url.format({
          pathname: redirectUrlPrefix,
          query: { ...req.query, consecutive },
        })
      )
    }

    // If the punishment is not consecutive, save the data and go back to the award punishments page
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: Number(days),
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, req.params.redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
      throw postError
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }

  private getRedirectUrl = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(chargeNumber)
  }
}
