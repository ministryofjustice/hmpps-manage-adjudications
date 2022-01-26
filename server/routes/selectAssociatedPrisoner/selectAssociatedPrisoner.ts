import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PrisonerSearchService, { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import validateForm from '../prisonerSearch/prisonerSearchValidation'

type PageData = {
  error?: FormError
  searchResults?: PrisonerSearchSummary[]
  searchTerm: string
  redirectUrl?: string
}
export default class SelectAssociatedPrisonerRoutes {
  constructor(private readonly prisonerSearchService: PrisonerSearchService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, searchTerm, redirectUrl } = pageData

    return res.render('pages/associatedPrisonerSelect', {
      errors: error ? [error] : [],
      searchResults,
      searchTerm,
      redirectUrl,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonNumber, id } = req.params
    const { startUrl } = req.query
    const searchTerm = JSON.stringify(req.query.searchTerm)?.replace(/"/g, '')
    const { redirectUrl } = req.session

    if (!searchTerm) return res.redirect(`/${startUrl}/${prisonNumber}/${id}`)

    const searchResults = await this.prisonerSearchService.search(
      { searchTerm, prisonIds: [user.activeCaseLoad.caseLoadId] },
      user
    )

    return this.renderView(req, res, {
      searchResults,
      searchTerm,
      redirectUrl,
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
        pathname: '/select-associated-prisoner',
        query: { searchTerm, redirectUrl },
      })
    )
  }
}
