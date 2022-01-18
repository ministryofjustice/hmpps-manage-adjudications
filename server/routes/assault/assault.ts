import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PrisonerResult from '../../data/prisonerResult'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import validatePrisonerSearch from './assaultedPrisonerValidation'
import validatePrisonOfficerSearch from './assaultedPrisonOfficerValidation'

type PageData = {
  error?: FormError
  associatedPerson?: string
  radioSelected?: string
  searchSuccessful?: boolean
  prisoner?: PrisonerResult
  associatedPersonDetails?: { id: string; name: string }
  assaultedPrisonerInput?: string
  assaultedPrisonOfficerFirstname?: string
  assaultedPrisonOfficerLastname?: string
}

const submitValue = (
  assaultRadios: string,
  radioSelected: string,
  selectedPerson: string,
  assaultedOtherStaffInput: string,
  assaultedOtherMiscInput: string
): { assaultRadios: string; selectedPerson: string } | null => {
  switch (assaultRadios) {
    case radioSelected:
      return { assaultRadios, selectedPerson }
    case 'assaultedOtherStaff':
      return { assaultRadios, selectedPerson: assaultedOtherStaffInput }
    case 'assaultedOtherMisc':
      return { assaultRadios, selectedPerson: assaultedOtherMiscInput }
    default:
      return null
  }
}

export default class AssaultRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const {
      error,
      radioSelected,
      associatedPersonDetails,
      assaultedPrisonerInput,
      assaultedPrisonOfficerFirstname,
      assaultedPrisonOfficerLastname,
    } = pageData
    const { prisonerNumber, id } = req.params

    return res.render(`pages/assault`, {
      errors: error ? [error] : [],
      radioSelected,
      associatedPersonDetails,
      exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${id}`,
      prisonerNumber,
      id,
      assaultedPrisonerInput,
      assaultedPrisonOfficerFirstname,
      assaultedPrisonOfficerLastname,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const radioSelected = JSON.stringify(req.query.radioSelected)?.replace(/"/g, '')
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const associatedPersonDetails = { id: selectedPerson, name: '' }
    if (selectedPerson) {
      if (radioSelected === 'assaultedPrisoner') {
        const prisoner = await this.placeOnReportService.getPrisonerDetails(selectedPerson, user)
        associatedPersonDetails.name = prisoner.displayName
      } else if (radioSelected === 'assaultedPrisonOfficer') {
        const staffMember = await this.userService.getStaffFromUsername(selectedPerson, user)
        associatedPersonDetails.name = staffMember.name
      }
    }
    return this.renderView(req, res, {
      radioSelected,
      associatedPerson: selectedPerson,
      associatedPersonDetails,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { id, prisonerNumber } = req.params
    const {
      search,
      assaultedPrisonerInput,
      assaultedPrisonOfficerFirstname,
      assaultedPrisonOfficerLastname,
      assaultRadios,
      assaultedOtherStaffInput,
      assaultedOtherMiscInput,
    } = req.body
    const { selectedPerson, radioSelected } = req.query
    if (search) {
      const error =
        search === 'assaultedPrisonerSearchSubmit'
          ? validatePrisonerSearch({ searchTerm: assaultedPrisonerInput })
          : validatePrisonOfficerSearch({
              firstName: assaultedPrisonOfficerFirstname,
              lastName: assaultedPrisonOfficerLastname,
            })

      if (error)
        return this.renderView(req, res, {
          error,
          radioSelected: assaultRadios,
          assaultedPrisonerInput,
          assaultedPrisonOfficerFirstname,
          assaultedPrisonOfficerLastname,
        })

      const searchPageHref =
        search === 'assaultedPrisonerSearchSubmit'
          ? `/select-associated-prisoner?searchTerm=${assaultedPrisonerInput}`
          : `/select-associated-staff?searchFirstName=${assaultedPrisonOfficerFirstname}&searchLastName=${assaultedPrisonOfficerLastname}`
      return res.redirect(
        `${searchPageHref}&redirectUrl=/assault/${prisonerNumber}/${id}?radioSelected=${assaultRadios}&startUrl=assault`
      )
    }
    const result = submitValue(
      assaultRadios,
      radioSelected as string,
      selectedPerson as string,
      assaultedOtherStaffInput,
      assaultedOtherMiscInput
    )
    // submit the result to the server here and redirect to next page
    try {
      // API call to post data to database
      // eslint-disable-next-line no-console
      console.log(result)
      return res.redirect('/somewhere')
    } catch (error) {
      res.locals.redirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${id}`
      throw error
    }
  }
}
