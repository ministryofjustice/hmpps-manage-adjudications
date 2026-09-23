/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import UserService from '../../../../services/userService'
import { getApiValidationMessage } from '../../../../utils/apiError'
import { FormError } from '../../../../@types/template'

export enum PageRequestType {
  CREATION,
  EDIT_SUBMITTED,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

export default class CheckPunishmentsPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return this.renderView(req, res)
  }

  private renderView = async (req: Request, res: Response, error?: FormError): Promise<void> => {
    const { chargeNumber } = req.params

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const filteredPunishments = await this.punishmentsService.filteredPunishments(punishments)

    let reasonForChange = null
    if (this.pageOptions.isPreviouslySubmitted() && req.query.punishmentsChanged) {
      reasonForChange = this.punishmentsService.getReasonForChangePunishments(req, chargeNumber)
    }

    const rehabActivities = await this.punishmentsService.getRehabActivitiesFromSession(req, chargeNumber)

    return res.render(`pages/checkPunishments.njk`, {
      chargeNumber,
      errors: error ? [error] : [],
      punishments,
      filteredPunishments,
      reasonForChange,
      changePunishmentLink: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      rehabActivities,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)

    if (this.pageOptions.isPreviouslySubmitted()) {
      let punishmentsSaved = false
      try {
        if (req.query.punishmentsChanged) {
          const { reasonForChange, detailsOfChange } = this.punishmentsService.getReasonForChangePunishments(
            req,
            chargeNumber,
          )
          await this.punishmentsService.editPunishmentSet(punishments, chargeNumber, user)
          punishmentsSaved = true
          await this.punishmentsService.createReasonForChangingPunishmentComment(
            chargeNumber,
            detailsOfChange,
            reasonForChange,
            user,
          )
        } else {
          await this.punishmentsService.editPunishmentSet(punishments, chargeNumber, user)
        }
        return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
      } catch (postError) {
        const validationMessage = !punishmentsSaved && getApiValidationMessage(postError)
        if (validationMessage) {
          return this.renderView(req, res, { href: '#change-punishments', text: validationMessage })
        }
        res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
        throw postError
      }
    }

    try {
      await this.punishmentsService.createPunishmentSet(punishments, chargeNumber, user)
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
    } catch (postError) {
      const validationMessage = getApiValidationMessage(postError)
      if (validationMessage) {
        return this.renderView(req, res, { href: '#change-punishments', text: validationMessage })
      }
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }
  }
}
