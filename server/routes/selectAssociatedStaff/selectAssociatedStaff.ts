import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import validateForm from './staffSearchValidation'
import PlaceOnReportService, { StaffSearchWithCurrentLocation } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
import type { ApiPageResponse } from '../../data/ApiData'

type PageData = {
  error?: FormError
  searchResults?: ApiPageResponse<StaffSearchWithCurrentLocation>
  staffName: string
  redirectUrl?: string
}

export default class SelectAssociatedPrisonerRoutes {
  constructor(
    private readonly userService: UserService,
    private readonly placeOnReportService: PlaceOnReportService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, staffName, redirectUrl } = pageData

    return res.render('pages/associatedStaffSelect', {
      errors: error ? [error] : [],
      searchResults,
      pagination: searchResults
        ? mojPaginationFromPageResponse(
            searchResults,
            new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
          )
        : null,
      staffName,
      redirectUrl,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const staffName = JSON.stringify(req.query.staffName)?.replace(/"/g, '')
    const { redirectUrl } = req.session
    const extendedRedirectUrl = this.getExtendedRedirectUrl(redirectUrl)
    if (!staffName)
      return res.render(`pages/notFound.njk`, { url: req.headers.referer || adjudicationUrls.homepage.root })

    const results = await this.userService.getStaffFromNames(
      staffName,
      user,
      pageRequestFrom(20, +req.query.pageNumber || 1),
    )
    const searchResults = await this.placeOnReportService.getAssociatedStaffDetails(results)
    return this.renderView(req, res, {
      searchResults,
      staffName,
      redirectUrl: extendedRedirectUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { staffName } = req.body
    const { redirectUrl } = req.session

    const error = validateForm({ staffName })
    if (error) return this.renderView(req, res, { error, staffName })
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectAssociatedStaff.root,
        query: { staffName, redirectUrl },
      }),
    )
  }

  getExtendedRedirectUrl = (redirectUrl: string) => {
    if (!redirectUrl) return null
    if (redirectUrl.includes('selectedPerson')) return redirectUrl
    if (redirectUrl.includes('?')) return `${redirectUrl}&selectedPerson=`
    return `${redirectUrl}?selectedPerson=`
  }
}
