/* eslint-disable no-console */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import UserService, { StaffDetails } from '../../services/userService'
import validateForm from '../prisonerSearch/prisonerSearchValidation'

type PageData = {
  error?: FormError
  searchResults?: StaffDetails[]
  searchTerm: string
  redirectUrl?: string
}
export default class SelectAssociatedPrisonerRoutes {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchResults, searchTerm, redirectUrl } = pageData

    return res.render('pages/associatedStaffSelect', {
      errors: error ? [error] : [],
      journeyStartUrl: `/select-associated-staff?searchTerm=${searchTerm}&redirectUrl=${redirectUrl}`,
      searchResults,
      searchTerm,
      redirectUrl,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const searchTerm = JSON.stringify(req.query.searchTerm)?.replace(/"/g, '')
    const redirectUrl = JSON.stringify(req.query.redirectUrl)?.replace(/"/g, '')
    // if (!searchTerm) return res.redirect('/search-for-prisoner')

    const searchResults = await this.userService.getStaff(searchTerm, user)
    console.log('in controller', searchResults)

    return this.renderView(req, res, { searchResults, searchTerm, redirectUrl })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.body
    const redirectUrl = JSON.stringify(req.query.redirectUrl)?.replace(/"/g, '')
    const error = validateForm({ searchTerm })
    if (error) return this.renderView(req, res, { error, searchTerm })
    return res.redirect(
      url.format({
        pathname: '/select-associated-staff',
        query: { searchTerm, redirectUrl },
      })
    )
  }
}
