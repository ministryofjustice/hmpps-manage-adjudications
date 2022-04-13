import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import validateForm from './staffSearchValidation'
import PlaceOnReportService, { StaffSearchWithCurrentLocation } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  searchResults?: StaffSearchWithCurrentLocation[]
  staffFirstName: string
  staffLastName: string
  redirectUrl?: string
}

export default class SelectAssociatedPrisonerRoutes {
  constructor(private readonly userService: UserService, private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, staffFirstName, staffLastName, redirectUrl } = pageData

    return res.render('pages/associatedStaffSelect', {
      errors: error ? [error] : [],
      searchResults,
      staffFirstName,
      staffLastName,
      redirectUrl,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const staffFirstName = JSON.stringify(req.query.staffFirstName)?.replace(/"/g, '')
    const staffLastName = JSON.stringify(req.query.staffLastName)?.replace(/"/g, '')
    const { redirectUrl } = req.session

    if (!staffFirstName || !staffLastName)
      return res.render(`pages/notFound.njk`, { url: req.headers.referer || adjudicationUrls.homepage.root })

    const results = await this.userService.getStaffFromNames(staffFirstName, staffLastName, user)
    const searchResults = await this.placeOnReportService.getAssociatedStaffDetails(results, user)
    return this.renderView(req, res, {
      searchResults,
      staffFirstName,
      staffLastName,
      redirectUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { staffFirstName, staffLastName } = req.body
    const { redirectUrl } = req.session
    const error = validateForm({ staffFirstName, staffLastName })
    if (error) return this.renderView(req, res, { error, staffFirstName, staffLastName })
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectAssociatedStaff.root,
        query: { staffFirstName, staffLastName, redirectUrl },
      })
    )
  }
}
