import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PrisonerResult from '../../data/prisonerResult'
import PlaceOnReportService from '../../services/placeOnReportService'

type PageData = {
  error?: FormError
  associatedPerson?: string
  radioSelected?: string
  searchSuccessful?: boolean
  prisoner?: PrisonerResult
  associatedPersonDetails?: { id: string; name: string }
}

export default class AssaultRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, radioSelected, associatedPersonDetails } = pageData
    const { prisonerNumber, id } = req.params

    return res.render(`pages/assault`, {
      errors: error ? [error] : [],
      radioSelected,
      associatedPersonDetails,
      exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${id}`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const radioSelected = JSON.stringify(req.query.radioSelected)?.replace(/"/g, '')
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const associatedPersonDetails = { id: selectedPerson, name: '' }
    if (selectedPerson) {
      const prisoner = await this.placeOnReportService.getPrisonerDetails(selectedPerson, user)
      associatedPersonDetails.name = prisoner.displayName
    }

    return this.renderView(req, res, {
      radioSelected,
      associatedPerson: selectedPerson,
      associatedPersonDetails,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { id, prisonerNumber } = req.params
    const { assaultedPrisonerId, assaultedPrisonOfficerId, assaultRadios } = req.body
    const { selectedPerson, radioSelected } = req.query
    if (req.body.search) {
      // redirect to prisoner search page or staff search page with details entered
      const searchPageHref =
        req.body.search === 'assaultedPrisonerSearchSubmit'
          ? `/select-associated-prisoner?searchTerm=${assaultedPrisonerId}`
          : `/select-associated-staff?searchTerm=${assaultedPrisonOfficerId}`
      res.redirect(`${searchPageHref}&redirectUrl=/assault/${prisonerNumber}/${id}?radioSelected=${assaultRadios}`)
    } else {
      // do overall form submit with data collected
      console.log(radioSelected, ' = ', selectedPerson)
    }
  }
}
