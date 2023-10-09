/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import UserService from '../../../../services/userService'

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
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    const { chargeNumber } = req.params

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const filteredPunishments = await this.punishmentsService.filteredPunishments(punishments)

    let reasonForChange = null
    if (this.pageOptions.isPreviouslySubmitted() && req.query.punishmentsChanged) {
      reasonForChange = this.punishmentsService.getReasonForChangePunishments(req, chargeNumber)
    }

    return res.render(`pages/checkPunishments.njk`, {
      chargeNumber,
      punishments,
      filteredPunishments,
      reasonForChange,
      changePunishmentLink: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)

    if (this.pageOptions.isPreviouslySubmitted()) {
      try {
        if (req.query.punishmentsChanged) {
          const { reasonForChange, detailsOfChange } = this.punishmentsService.getReasonForChangePunishments(
            req,
            chargeNumber
          )
          Promise.all([
            await this.punishmentsService.editPunishmentSet(punishments, chargeNumber, user),
            await this.punishmentsService.createReasonForChangingPunishmentComment(
              chargeNumber,
              detailsOfChange,
              reasonForChange,
              user
            ),
          ])
        } else {
          await this.punishmentsService.editPunishmentSet(punishments, chargeNumber, user)
        }
        return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
        throw postError
      }
    }

    try {
      await this.punishmentsService.createPunishmentSet(punishments, chargeNumber, user)
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }
  }
}
