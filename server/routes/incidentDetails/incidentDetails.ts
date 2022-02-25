import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'
import { User } from '../../data/hmppsAuthClient'
import { codeFromIncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string | number
  originalRadioSelection?: string
  incitedInput?: string
  assistedInput?: string
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
      incitedInput,
      assistedInput,
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

    const associatedPrisonersName = selectedPerson
      ? await this.getCurrentAssociatedPrisonerDetails(associatedPrisonersNumber, selectedPerson, user)
      : null

    const data = {
      incidentDate: this.getIncidentDate(incidentDate),
      locationId,
      originalRadioSelection,
      associatedPrisonersNumber: selectedPerson,
      associatedPrisonersName,
    }

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisonerNumber,
      prisoner,
      locations,
      data,
      reportingOfficer: reporter || '',
      submitButtonText: 'Save and continue',
      incitedInput,
      assistedInput,
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
      incitedInput,
      assistedInput,
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
      const searchValue = search === 'incitedSearchSubmit' ? incitedInput : assistedInput
      const error = validatePrisonerSearch({ searchTerm: searchValue, inputId: currentRadioSelected })
      if (error)
        return this.renderView(req, res, {
          error,
          incidentDate,
          locationId,
          originalRadioSelection: currentRadioSelected,
          incitedInput,
          assistedInput,
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

    const incidentRoleCode = codeFromIncidentRole(currentRadioSelected)

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
      return res.redirect(`/offence-code-selection/${id}/${incidentRoleFromCode(incidentRoleCode)}`)
    } catch (postError) {
      logger.error(`Failed to post incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${prisonerNumber}`
      throw postError
    }
  }
}
