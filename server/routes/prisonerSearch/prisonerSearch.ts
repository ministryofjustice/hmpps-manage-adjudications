import url from 'url'
import { Request, Response } from 'express'
import validateForm from './prisonerSearchValidation'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import UserService from '../../services/userService'

export default class PrisonerSearchRoutes {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, error?: FormError, forbidden = false): Promise<void> => {
    return res.render('pages/prisonerSearch', {
      errors: error ? [error] : [],
      forbidden,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const transfer = req.query.transfer as string
    if (transfer === 'true') {
      const userRoles = await this.userService.getUserRoles(res.locals.user.token)
      if (!hasAnyRole(['GLOBAL_SEARCH'], userRoles)) {
        return this.renderView(req, res, undefined, true)
      }
    }
    return this.renderView(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.body
    const transfer = req.query.transfer as string
    const error = validateForm({ searchTerm })

    if (error) return this.renderView(req, res, error)

    const query: Record<string, string> = { searchTerm }
    if (transfer === 'true') query.transfer = transfer

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectPrisoner.root,
        query,
      })
    )
  }
}
