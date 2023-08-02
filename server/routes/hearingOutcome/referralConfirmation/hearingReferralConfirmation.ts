import { Request, Response } from 'express'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'

export default class HearingReasonForReferralPage {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params

    return res.render(`pages/hearingOutcome/hearingReferralConfirmation.njk`, {
      returnLinkUrl: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return this.renderView(req, res)
  }
}
