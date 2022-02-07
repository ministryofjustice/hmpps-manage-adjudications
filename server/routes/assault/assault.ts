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
  originalRadioSelection?: string
  searchSuccessful?: boolean
  prisoner?: PrisonerResult
  associatedPersonDetails?: { id: string; name: string }
  assaultedPrisonerInput?: string
  assaultedPrisonOfficerFirstname?: string
  assaultedPrisonOfficerLastname?: string
}

// const submitValue = (
//   currentRadioSelected: string,
//   originalRadioSelection: string,
//   selectedPerson: string,
//   assaultedOtherStaffInput: string,
//   assaultedOtherMiscInput: string
// ): { currentRadioSelected: string; selectedPerson: string } | null => {
//   switch (currentRadioSelected) {
//     case originalRadioSelection:
//       return { currentRadioSelected, selectedPerson }
//     case 'assaultedOtherStaff':
//       return { currentRadioSelected, selectedPerson: assaultedOtherStaffInput }
//     case 'assaultedOtherMisc':
//       return { currentRadioSelected, selectedPerson: assaultedOtherMiscInput }
//     default:
//       return null
//   }
// }

export default class AssaultRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const {
      error,
      originalRadioSelection,
      associatedPersonDetails,
      assaultedPrisonerInput,
      assaultedPrisonOfficerFirstname,
      assaultedPrisonOfficerLastname,
    } = pageData
    const { prisonerNumber, id } = req.params

    return res.render(`pages/assault`, {
      errors: error ? [error] : [],
      originalRadioSelection,
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
    const originalRadioSelection = JSON.stringify(req.query.originalRadioSelection)?.replace(/"/g, '')
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const associatedPersonDetails = { id: selectedPerson, name: '' }
    if (selectedPerson) {
      if (originalRadioSelection === 'assaultedPrisoner') {
        const prisoner = await this.placeOnReportService.getPrisonerDetails(selectedPerson, user)
        associatedPersonDetails.name = prisoner.displayName
      } else if (originalRadioSelection === 'assaultedPrisonOfficer') {
        const staffMember = await this.userService.getStaffFromUsername(selectedPerson, user)
        associatedPersonDetails.name = staffMember.name
      }
    }
    return this.renderView(req, res, {
      originalRadioSelection,
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
      currentRadioSelected,
      assaultedOtherStaffInput,
      assaultedOtherMiscInput,
    } = req.body
    const { selectedPerson, originalRadioSelection } = req.query
    if (search) {
      const prisonerAssaulted = search === 'assaultedPrisonerSearchSubmit'
      const error = prisonerAssaulted
        ? validatePrisonerSearch({ searchTerm: assaultedPrisonerInput })
        : validatePrisonOfficerSearch({
            staffFirstName: assaultedPrisonOfficerFirstname,
            staffLastName: assaultedPrisonOfficerLastname,
          })

      if (error)
        return this.renderView(req, res, {
          error,
          originalRadioSelection: currentRadioSelected,
          assaultedPrisonerInput,
          assaultedPrisonOfficerFirstname,
          assaultedPrisonOfficerLastname,
        })
      req.session.redirectUrl = `/assault/${prisonerNumber}/${id}?originalRadioSelection=${currentRadioSelected}`
      const searchPageHref = prisonerAssaulted
        ? `/select-associated-prisoner?searchTerm=${assaultedPrisonerInput}`
        : `/select-associated-staff/${prisonerNumber}/${id}?staffFirstName=${assaultedPrisonOfficerFirstname}&staffLastName=${assaultedPrisonOfficerLastname}`
      return res.redirect(`${searchPageHref}&startUrl=assault`)
    }

    //
    // const result = submitValue(
    //   currentRadioSelected,
    //   originalRadioSelection as string,
    //   selectedPerson as string,
    //   assaultedOtherStaffInput,
    //   assaultedOtherMiscInput
    // )
    // submit the result to the server here and redirect to next page
    try {
      // API call to post data to database
      // eslint-disable-next-line no-console
      return res.redirect('/somewhere')
    } catch (error) {
      res.locals.redirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${id}`
      throw error
    }
  }
}
