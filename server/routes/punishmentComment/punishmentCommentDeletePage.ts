/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

type PageData = {
  error?: FormError
  punishmentComment?: string
}

export default class ConfirmDeletionPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, punishmentComment } = pageData

    return res.render(`pages/punishmentCommentConfirmDeletion.njk`, {
      errors: error ? [error] : [],
      punishmentComment,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    const { chargeNumber } = req.params
    const punishmentComments = await this.punishmentsService.getPunishmentCommentsFromServer(chargeNumber, user)

    const id = Number(req.params.id)
    const punishmentComment = punishmentComments?.find(comment => comment.id === id)
    if (!punishmentComment) {
      return res.render('pages/notFound.njk', {
        url: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      })
    }

    return this.renderView(req, res, { punishmentComment: punishmentComment.comment })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params
    const id = Number(req.params.id)
    const { removeComment } = req.body

    if (removeComment === undefined) {
      const error = { href: '#removeComment', text: 'Select yes if you want to remove this comment' } as FormError
      const punishmentComments = await this.punishmentsService.getPunishmentCommentsFromServer(chargeNumber, user)
      const punishmentComment = punishmentComments.find(comment => comment.id === id)
      if (!punishmentComment) {
        return res.render('pages/notFound.njk', {
          url: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
        })
      }

      return this.renderView(req, res, { error, punishmentComment: punishmentComment.comment })
    }

    if (removeComment === 'yes' && hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      await this.punishmentsService.removePunishmentComment(chargeNumber, id, user)
    }

    const redirectUrlPrefix = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
      })
    )
  }
}
