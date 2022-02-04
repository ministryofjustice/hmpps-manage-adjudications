import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string | number
  queryRadioSelection?: string
  inciteAnotherPrisonerInput?: string
  assistAnotherPrisonerInput?: string
}

export default class IncidentDetailsRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService
  ) {}

  private getIncidentDate = (userProvidedValue: SubmittedDateTime) => {
    if (userProvidedValue) {
      const {
        date,
        time: { hour, minute },
      } = userProvidedValue
      return { date, hour, minute }
    }
    return null
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentDate, locationId, inciteAnotherPrisonerInput, assistAnotherPrisonerInput } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const queryRadioSelection = JSON.stringify(req.query.queryRadioSelection)?.replace(/"/g, '')

    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      this.placeOnReportService.getReporterName(user.username, user),
    ])
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const data = {
      incidentDate: this.getIncidentDate(incidentDate),
      locationId,
    }

    const associatedPersonDetails = { id: selectedPerson, name: '' }
    if (selectedPerson) {
      const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(selectedPerson, user)
      associatedPersonDetails.name = associatedPrisoner.displayName
    }

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisonerNumber,
      prisoner,
      locations,
      data,
      reportingOfficer: reporter || '',
      submitButtonText: 'Save and continue',
      reportPreviouslySubmitted: false,
      queryRadioSelection,
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
      associatedPersonDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const pageData = {
      incidentDate: req.session.incidentDate,
      locationId: req.session.incidentLocation,
    }
    delete req.session.incidentDate
    delete req.session.incidentLocation
    return this.renderView(req, res, pageData)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const {
      incidentDate,
      locationId,
      currentRadioSelected,
      search,
      deleteAssociatedPrisoner,
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
    } = req.body
    const { user } = res.locals
    const { prisonerNumber } = req.params
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const queryRadioSelection = JSON.stringify(req.query.queryRadioSelection)?.replace(/"/g, '')

    if (deleteAssociatedPrisoner) {
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      const restartUrl =
        deleteAssociatedPrisoner === 'inciteAnotherPrisonerDelete'
          ? `/incident-details/${prisonerNumber}?queryRadioSelection=inciteAnotherPrisoner`
          : `/incident-details/${prisonerNumber}?queryRadioSelection=assistAnotherPrisoner`
      return res.redirect(restartUrl)
    }

    if (search) {
      const searchValue =
        search === 'inciteAnotherPrisonerSearchSubmit' ? inciteAnotherPrisonerInput : assistAnotherPrisonerInput
      const error = validatePrisonerSearch({ searchTerm: searchValue, inputId: currentRadioSelected })
      if (error)
        return this.renderView(req, res, {
          error,
          incidentDate,
          locationId,
          queryRadioSelection: currentRadioSelected,
          inciteAnotherPrisonerInput,
          assistAnotherPrisonerInput,
        })
      req.session.redirectUrl = `/incident-details/${prisonerNumber}?queryRadioSelection=${currentRadioSelected}`
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      const searchPageHref = `/select-associated-prisoner?searchTerm=${searchValue}`
      return res.redirect(`${searchPageHref}&startUrl=incident-details`)
    }

    // Check the selectedPerson has not been tampered with in URL
    const associatedPrisonersNumber = isPrisonerIdentifier(selectedPerson) ? selectedPerson : null

    const error = validateForm({
      incidentDate,
      locationId,
      incidentRole: currentRadioSelected,
      associatedPrisonersNumber,
    })
    if (error) return this.renderView(req, res, { error, incidentDate, locationId })

    try {
      const newAdjudication = await this.placeOnReportService.startNewDraftAdjudication(
        formatDate(incidentDate),
        locationId,
        prisonerNumber,
        associatedPrisonersNumber,
        currentRadioSelected,
        queryRadioSelection,
        inciteAnotherPrisonerInput,
        assistAnotherPrisonerInput,
        user
      )
      delete req.session.redirectUrl

      const { id } = newAdjudication.draftAdjudication
      return res.redirect(`/offence-details/${prisonerNumber}/${id}`)
    } catch (postError) {
      logger.error(`Failed to post incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${prisonerNumber}`
      throw postError
    }
  }
}
