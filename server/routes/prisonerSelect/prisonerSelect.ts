import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PrisonerSearchService, { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import UserService from '../../services/userService'
import validateForm from '../prisonerSearch/prisonerSearchValidation'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'

type PageData = {
  error?: FormError
  searchResults?: PrisonerSearchSummary[]
  searchTerm: string
  transfer?: string
}
export default class PrisonerSelectRoutes {
  constructor(
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly userService: UserService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { user } = res.locals
    const { error, searchTerm, transfer } = pageData
    const prisonIds = [user.meta.caseLoadId]

    if (transfer === 'true') {
      const userRoles = await this.userService.getUserRoles(res.locals.user.token)
      if (!hasAnyRole(['GLOBAL_SEARCH'], userRoles)) {
        return res.redirect(`${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
      }
      if (!error) prisonIds.pop()
    }

    let searchResults = null
    if (!error) {
      if (!searchTerm) return res.redirect(adjudicationUrls.searchForPrisoner.root)
      searchResults = await this.prisonerSearchService.search({ searchTerm, prisonIds }, user)

      if (prisonIds.length === 0) {
        searchResults = searchResults.filter(prisoner => prisoner.prisonId !== user.meta.caseLoadId)
      }
    }

    return res.render('pages/prisonerSelect', {
      errors: error ? [error] : [],
      journeyStartUrl: `${adjudicationUrls.selectPrisoner.root}?searchTerm=${searchTerm}`,
      searchResults,
      searchTerm,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const searchTerm = JSON.stringify(req.query.searchTerm)?.replace(/"/g, '')
    const transfer = JSON.stringify(req.query.transfer)?.replace(/"/g, '')

    return this.renderView(req, res, { searchTerm, transfer })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.body
    const transfer = JSON.stringify(req.query.transfer)?.replace(/"/g, '')

    const error = validateForm({ searchTerm })

    if (error) return this.renderView(req, res, { error, searchTerm, transfer })

    if (transfer === 'true') {
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.selectPrisoner.root,
          query: { searchTerm, transfer },
        })
      )
    }
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectPrisoner.root,
        query: { searchTerm },
      })
    )
  }
}
