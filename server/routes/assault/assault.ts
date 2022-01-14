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
      // assaultedOtherStaffInput,
      // assaultedOtherMiscInput,
    } = req.body
    const { selectedPerson, radioSelected } = req.query
    // check which submit button has been clicked
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
          : `/select-associated-staff?searchTerm=${assaultedPrisonOfficerFirstname} ${assaultedPrisonOfficerLastname}`
      res.redirect(
        `${searchPageHref}&redirectUrl=/assault/${prisonerNumber}/${id}?radioSelected=${assaultRadios}&startUrl=assault`
      )
    } else {
      // check that a radio has been selected and a name given
      // do overall form submit with data collected
      // eslint-disable-next-line no-console
      console.log(radioSelected, ' = ', selectedPerson)
    }
    return res.redirect('/somewhere')
  }
}
