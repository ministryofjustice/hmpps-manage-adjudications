import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { radioToIncidentRole } from './incidentRoleCode'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'
import { User } from '../../data/hmppsAuthClient'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string | number
  originalRadioSelection?: string
  inciteAnotherPrisonerInput?: string
  assistAnotherPrisonerInput?: string
  associatedPrisonersNumber?: string
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

  private getCurrentAssociatedPrisonerDetails = async (
    associatedPrisonersNumber: string,
    selectedPerson: string,
    user: User
  ) => {
    if (associatedPrisonersNumber === null) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(selectedPerson, user)
    return associatedPrisoner.displayName
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const {
      error,
      incidentDate,
      locationId,
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
      originalRadioSelection,
      associatedPrisonersNumber,
    } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')

    const [prisoner, reporter] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      this.placeOnReportService.getReporterName(user.username, user),
    ])
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const associatedPrisonerName = selectedPerson
      ? await this.getCurrentAssociatedPrisonerDetails(associatedPrisonersNumber, selectedPerson, user)
      : null

    const data = {
      incidentDate: this.getIncidentDate(incidentDate),
      locationId,
      originalRadioSelection,
      associatedPrisonerNumber: selectedPerson,
      associatedPrisonerName,
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
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const pageData = {
      incidentDate: req.session.incidentDate,
      locationId: req.session.incidentLocation,
      originalRadioSelection: req.session.originalRadioSelection,
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
    const { originalRadioSelection } = req.session

    if (deleteAssociatedPrisoner) {
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      req.session.originalRadioSelection = currentRadioSelected
      return res.redirect(`/incident-details/${prisonerNumber}`)
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
          originalRadioSelection: currentRadioSelected,
          inciteAnotherPrisonerInput,
          assistAnotherPrisonerInput,
        })
      req.session.redirectUrl = `/incident-details/${prisonerNumber}`
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      req.session.originalRadioSelection = currentRadioSelected
      return res.redirect(`/select-associated-prisoner?searchTerm=${searchValue}`)
    }

    const associatedPrisonersNumber =
      isPrisonerIdentifier(selectedPerson) && currentRadioSelected === originalRadioSelection ? selectedPerson : null

    const error = validateForm({
      incidentDate,
      locationId,
      incidentRole: currentRadioSelected,
      associatedPrisonersNumber,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        incidentDate,
        locationId,
        originalRadioSelection: currentRadioSelected,
        associatedPrisonersNumber,
      })

    const incidentRoleCode = radioToIncidentRole(currentRadioSelected)

    try {
      const newAdjudication = await this.placeOnReportService.startNewDraftAdjudication(
        formatDate(incidentDate),
        locationId,
        prisonerNumber,
        associatedPrisonersNumber,
        incidentRoleCode,
        user
      )
      delete req.session.redirectUrl
      delete req.session.originalRadioSelection
      const { id } = newAdjudication.draftAdjudication
      return res.redirect(`/offence-details/${prisonerNumber}/${id}`)
    } catch (postError) {
      logger.error(`Failed to post incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${prisonerNumber}`
      throw postError
    }
  }
}
