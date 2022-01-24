import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import UserService, { StaffSearchByName } from '../../services/userService'
import validateForm from './staffSearchValidation'

type PageData = {
  error?: FormError
  searchResults?: StaffSearchByName[]
  searchFirstName: string
  searchLastName: string
  redirectUrl?: string
}
export default class SelectAssociatedPrisonerRoutes {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, searchFirstName, searchLastName, redirectUrl } = pageData

    return res.render('pages/associatedStaffSelect', {
      errors: error ? [error] : [],
      searchResults,
      searchFirstName,
      searchLastName,
      redirectUrl,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonNumber, id } = req.params
    const { startUrl } = req.query
    const searchFirstName = JSON.stringify(req.query.searchFirstName)?.replace(/"/g, '')
    const searchLastName = JSON.stringify(req.query.searchLastName)?.replace(/"/g, '')
    const { redirectUrl } = req.session

    if (!searchFirstName || !searchLastName) return res.redirect(`/${startUrl}/${prisonNumber}/${id}`)

    const searchResults = await this.userService.getStaffFromNames(searchFirstName, searchLastName, user)

    return this.renderView(req, res, { searchResults, searchFirstName, searchLastName, redirectUrl })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchFirstName, searchLastName } = req.body

    const redirectUrl = JSON.stringify(req.query.redirectUrl)?.replace(/"/g, '')
    const error = validateForm({ searchFirstName, searchLastName })
    if (error) return this.renderView(req, res, { error, searchFirstName, searchLastName })
    return res.redirect(
      url.format({
        pathname: '/select-associated-staff',
        query: { searchFirstName, searchLastName, redirectUrl },
      })
    )
  }
}
