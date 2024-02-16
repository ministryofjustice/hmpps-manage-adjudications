import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PrisonerSearchService, { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import validateForm from '../prisonerSearch/prisonerSearchValidation'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  searchResults?: PrisonerSearchSummary[]
  searchTerm: string
  redirectUrl?: string
  queryConnector?: string
}
export default class SelectAssociatedPrisonerRoutes {
  constructor(private readonly prisonerSearchService: PrisonerSearchService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, searchTerm, redirectUrl, queryConnector } = pageData

    return res.render('pages/associatedPrisonerSelect', {
      errors: error ? [error] : [],
      searchResults,
      searchTerm,
      redirectUrl,
      queryConnector,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const searchTerm = JSON.stringify(req.query.searchTerm)?.replace(/"/g, '')
    const { redirectUrl } = req.session
    if (!searchTerm)
      return res.render(`pages/notFound.njk`, { url: req.headers.referer || adjudicationUrls.homepage.root })

    const searchResults = await this.prisonerSearchService.search(
      { searchTerm, prisonIds: [user.meta.caseLoadId] },
      user
    )

    const queryConnector = redirectUrl && redirectUrl.includes('?') ? '&' : '?'

    return this.renderView(req, res, {
      searchResults,
      searchTerm,
      redirectUrl,
      queryConnector: queryConnector || '?',
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.body
    const { redirectUrl } = req.session

    const error = validateForm({ searchTerm })

    if (error)
      return this.renderView(req, res, {
        error,
        searchTerm,
      })

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectAssociatedPrisoner.root,
        query: { searchTerm, redirectUrl },
      })
    )
  }
}
