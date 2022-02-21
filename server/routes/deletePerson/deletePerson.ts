import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import validateForm from './deletePersonValidation'
import { convertToTitleCase } from '../../utils/utils'
import { User } from '../../data/hmppsAuthClient'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'

type PageData = {
  error?: FormError
  associatedPersonFriendlyName?: string
}

export default class DeletePersonRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private getAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.friendlyName
  }

  private getAssociatedStaffName = async (associatedStaffUsername: string, user: User) => {
    const associatedStaff = await this.userService.getStaffFromUsername(associatedStaffUsername, user)
    return convertToTitleCase(associatedStaff.name)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, associatedPersonFriendlyName } = pageData
    return res.render(`pages/deletePerson.njk`, {
      errors: error ? [error] : [],
      associatedPersonFriendlyName,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const associatedPersonId = JSON.stringify(req.query.associatedPersonId)?.replace(/"/g, '')

    const associatedPersonFriendlyName = isPrisonerIdentifier(associatedPersonId)
      ? await this.getAssociatedPrisonersName(associatedPersonId, user)
      : await this.getAssociatedStaffName(associatedPersonId, user)

    this.renderView(req, res, { associatedPersonFriendlyName })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { deletePerson } = req.body
    const { redirectUrl } = req.session
    const { associatedPersonId } = req.query

    const error = validateForm({ deletePerson })
    if (error)
      return this.renderView(req, res, {
        error,
      })
    const queryConnector = redirectUrl.includes('?') ? '&' : '?'
    const redirect =
      deletePerson === 'yes'
        ? `${redirectUrl}${queryConnector}personDeleted=true`
        : `${redirectUrl}${queryConnector}selectedPerson=${associatedPersonId}`
    return res.redirect(redirect)
  }
}
