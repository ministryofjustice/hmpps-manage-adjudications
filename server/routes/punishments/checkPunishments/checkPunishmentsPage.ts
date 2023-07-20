/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PunishmentsService from '../../../services/punishmentsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import UserService from '../../../services/userService'

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
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
    let renderEmptyTable = false
    if (!!punishments && punishments.length === 0) {
      const punishmentsFromApi = await this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
      renderEmptyTable = !!punishmentsFromApi && punishmentsFromApi.length > 0
    }

    return res.render(`pages/checkPunishments.njk`, {
      adjudicationNumber,
      punishments,
      changePunishmentLink: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      renderEmptyTable,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)

    if (this.pageOptions.isPreviouslySubmitted()) {
      try {
        await this.punishmentsService.editPunishmentSet(punishments, adjudicationNumber, user)
        return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber))
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber)
        throw postError
      }
    }

    try {
      await this.punishmentsService.createPunishmentSet(punishments, adjudicationNumber, user)
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
