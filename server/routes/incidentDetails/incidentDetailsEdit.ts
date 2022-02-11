import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { incidentRoleToRadio, radioToIncidentRole } from './incidentRoleCode'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'
import { User } from '../../data/hmppsAuthClient'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string
  originalRadioSelection?: string
  inciteAnotherPrisonerInput?: string
  assistAnotherPrisonerInput?: string
  associatedPrisonersNumber?: string
}

export default class IncidentDetailsEditRoutes {
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

  private getCurrentAssociatedPrisonerName = async (associatedPrisonersNumber: string, user: User) => {
    if (associatedPrisonersNumber === null) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  private getAssociatedPrisonerNumber = (
    selectedRadio: string,
    previouslyReportedAssociatedPrisoner: string,
    newAssociatedPrisoner: string
  ): string => {
    if (selectedRadio === 'onTheirOwn' || selectedRadio === 'attemptOnTheirOwn') return null
    if (newAssociatedPrisoner !== undefined) return newAssociatedPrisoner
    if (previouslyReportedAssociatedPrisoner !== undefined) return previouslyReportedAssociatedPrisoner
    return null
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const {
      error,
      incidentDate,
      locationId,
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
      originalRadioSelection,
    } = pageData
    const { prisonerNumber, id } = req.params
    const { user } = res.locals
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')

    const IdNumberValue: number = parseInt(id as string, 10)

    const [prisoner, existingDraftIncidentDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      this.placeOnReportService.getDraftIncidentDetailsForEditing(IdNumberValue, user),
    ])

    req.session.originalAssociatedPrisonerNumber = existingDraftIncidentDetails.incidentRole.associatedPrisonersNumber

    const { startedByUserId } = existingDraftIncidentDetails
    const reporter = await this.placeOnReportService.getReporterName(startedByUserId, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const radioButtonSelected =
      originalRadioSelection || incidentRoleToRadio(existingDraftIncidentDetails.incidentRole.roleCode)

    const associatedPrisonerNumber = this.getAssociatedPrisonerNumber(
      radioButtonSelected,
      existingDraftIncidentDetails.incidentRole.associatedPrisonersNumber,
      selectedPerson
    )

    const associatedPrisonerName = await this.getCurrentAssociatedPrisonerName(associatedPrisonerNumber, user)

    const data = {
      incidentDate: this.getIncidentDate(incidentDate) || this.getIncidentDate(existingDraftIncidentDetails.dateTime),
      locationId: locationId || existingDraftIncidentDetails.locationId,
      originalRadioSelection: radioButtonSelected,
      associatedPrisonerNumber,
      associatedPrisonerName,
    }
    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisoner,
      locations,
      data,
      reportingOfficer: reporter || '',
      submitButtonText: 'Save and continue',
      exitButtonHref: `/place-the-prisoner-on-report/${prisonerNumber}/${id}`,
      inciteAnotherPrisonerInput,
      assistAnotherPrisonerInput,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const pageData = {
      incidentDate: req.session.incidentDate,
      locationId: req.session.incidentLocation as unknown as string,
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
    const { prisonerNumber, id } = req.params
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const { originalRadioSelection } = req.session

    if (deleteAssociatedPrisoner) {
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      delete req.session.originalRadioSelection
      delete req.session.redirectUrl

      // TODO: In here we need to redirect to the delete page, and on the submit button do a PUT request to remove the associated prisoner and incident rolecode, then redirect back to /incident-details/<PRN>/<id>/edit
      return res.redirect(`/delete-person`)
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
      req.session.redirectUrl = `/incident-details/${prisonerNumber}/${id}/edit`
      req.session.originalRadioSelection = currentRadioSelected
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      return res.redirect(`/select-associated-prisoner?searchTerm=${searchValue}`)
    }

    const newlySelectedAssociatedPrisonersNumber =
      isPrisonerIdentifier(selectedPerson) && currentRadioSelected === originalRadioSelection ? selectedPerson : null

    const associatedPrisonersNumber =
      newlySelectedAssociatedPrisonersNumber || req.session.originalAssociatedPrisonerNumber
    delete req.session.originalAssociatedPrisonerNumber

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

    const IdNumberValue: number = parseInt(id as string, 10)
    const incidentRoleCode = radioToIncidentRole(currentRadioSelected)

    try {
      await this.placeOnReportService.editDraftIncidentDetails(
        IdNumberValue,
        formatDate(incidentDate),
        locationId,
        associatedPrisonersNumber,
        incidentRoleCode,
        user
      )
      delete req.session.redirectUrl
      delete req.session.originalRadioSelection

      return res.redirect(`/offence-details/${prisonerNumber}/${id}`)
    } catch (postError) {
      logger.error(`Failed to post edited incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/offence-details/${prisonerNumber}/${id}`
      throw postError
    }
  }
}
