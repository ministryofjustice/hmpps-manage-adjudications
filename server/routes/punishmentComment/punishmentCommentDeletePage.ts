/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const punishmentComments = await this.punishmentsService.getPunishmentCommentsFromServer(adjudicationNumber, user)

    const id = Number(req.params.id)
    const punishmentComment = punishmentComments.find(comment => comment.id === id)
    if (!punishmentComment) {
      return res.render('pages/notFound.njk', {
        url: adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber),
      })
    }

    return this.renderView(req, res, { punishmentComment: punishmentComment.comment })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const id = Number(req.params.id)
    const { removeComment } = req.body

    if (removeComment === undefined) {
      const error = { href: '#removeComment', text: 'Please select required option' } as FormError
      const punishmentComments = await this.punishmentsService.getPunishmentCommentsFromServer(adjudicationNumber, user)
      const punishmentComment = punishmentComments.find(comment => comment.id === id)
      if (!punishmentComment) {
        return res.render('pages/notFound.njk', {
          url: adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber),
        })
      }

      return this.renderView(req, res, { error, punishmentComment: punishmentComment.comment })
    }

    if (removeComment === 'yes' && hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      await this.punishmentsService.removePunishmentComment(adjudicationNumber, id, user)
    }

    const redirectUrlPrefix = adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
      })
    )
  }
}
