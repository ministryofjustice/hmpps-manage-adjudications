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
}
export default class PrisonerSelectRoutes {
  journeyPage: SelectPrisoner

  constructor(private readonly prisonerSearchService: PrisonerSearchService) {
    this.journeyPage = new SelectPrisoner()
  }

  matchers = (): string => {
    return this.journeyPage.url.matchers.whatever
  }
  
  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, searchTerm } = pageData

    const exampleUrl = this.journeyPage.incidentDetailsCreate.url(prisonerNumber)

    return res.render('pages/prisonerSelect', {
      errors: error ? [error] : [],
      journeyStartUrl: `${this.journeyPage.url}?searchTerm=${searchTerm}`,
      searchResults,
      searchTerm,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const searchTerm = JSON.stringify(req.query.searchTerm)?.replace(/"/g, '')

    if (!searchTerm) return res.redirect(this.journeyPage.url)

    const searchResults = await this.prisonerSearchService.search(
      { searchTerm, prisonIds: [user.activeCaseLoad.caseLoadId] },
      user
    )

    return this.renderView(req, res, { searchResults, searchTerm })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.body

    const error = validateForm({ searchTerm })

    if (error) return this.renderView(req, res, { error, searchTerm })

    return res.redirect(
      url.format({
        pathname: this.journeyPage.root,
        query: { searchTerm },
      })
    )
  }
}
