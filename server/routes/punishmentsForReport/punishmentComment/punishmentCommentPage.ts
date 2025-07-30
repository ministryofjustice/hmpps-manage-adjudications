/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import validateForm from './punishmentCommentValidation'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

type PageData = {
  error?: FormError
  punishmentComment?: string
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

export default class PunishmentCommentPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, punishmentComment } = pageData

    return res.render(`pages/punishmentComment.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      errors: error ? [error] : [],
      punishmentComment,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const { user } = res.locals
      const { chargeNumber } = req.params
      const punishmentComments = await this.punishmentsService.getPunishmentCommentsFromServer(chargeNumber, user)

      const id = Number(req.params.id)
      const punishmentComment = punishmentComments.find(comment => comment.id === id)
      if (!punishmentComment) {
        return res.render('pages/notFound.njk', {
          url: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
        })
      }

      return this.renderView(req, res, { punishmentComment: punishmentComment.comment })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { punishmentComment } = req.body

    const error = validateForm({ punishmentComment })

    if (error) {
      return this.renderView(req, res, { error, punishmentComment })
    }

    if (this.pageOptions.isEdit()) {
      const id = Number(req.params.id)
      await this.punishmentsService.editPunishmentComment(chargeNumber, id, punishmentComment, user)
    } else {
      await this.punishmentsService.createPunishmentComment(chargeNumber, punishmentComment, user)
    }

    const redirectUrlPrefix = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
      }),
    )
  }
}
