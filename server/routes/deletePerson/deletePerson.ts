import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import validateForm from './deletePersonValidation'
import { convertToTitleCase } from '../../utils/utils'
import { User } from '../../data/hmppsManageUsersClient'
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

  private getFriendlyName = async (associatedPersonId: string, user: User) => {
    return isPrisonerIdentifier(associatedPersonId)
      ? this.getAssociatedPrisonersName(associatedPersonId, user)
      : this.getAssociatedStaffName(associatedPersonId, user)
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

    const associatedPersonFriendlyName = await this.getFriendlyName(associatedPersonId, user)

    return this.renderView(req, res, {
      associatedPersonFriendlyName,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { deletePerson } = req.body
    const { redirectUrl } = req.session
    const { associatedPersonId } = req.query

    const error = validateForm({ deletePerson })
    if (error) {
      const associatedPersonFriendlyName = await this.getFriendlyName(associatedPersonId as string, user)
      return this.renderView(req, res, {
        error,
        associatedPersonFriendlyName,
      })
    }

    const queryConnector = redirectUrl.includes('?') ? '&' : '?'
    const redirect =
      deletePerson === 'yes'
        ? `${redirectUrl}${queryConnector}personDeleted=true`
        : `${redirectUrl}${queryConnector}selectedPerson=${associatedPersonId}`
    return res.redirect(redirect)
  }
}
