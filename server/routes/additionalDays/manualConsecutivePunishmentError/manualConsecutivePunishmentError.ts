import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'

export default class ManualConsecutivePunishmentErrorPage {
  constructor(private readonly userService: UserService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return res.render(`pages/manualConsecutivePunishmentError.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
    })
  }
}
