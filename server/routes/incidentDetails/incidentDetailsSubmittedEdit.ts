import { Request, Response } from 'express'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import validateForm from './incidentDetailsValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { incidentRoleToRadio, radioToIncidentRole } from './incidentRoleCode'
import { User } from '../../data/hmppsAuthClient'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string
  originalRadioSelection?: string
  inciteAnotherPrisonerInput?: string
  assistAnotherPrisonerInput?: string
  associatedPrisonersNumber?: string
}

export default class IncidentDetailsSubmittedEditRoutes {
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
    newAssociatedPrisoner: string,
    personDeleted: string
  ): string => {
    if (selectedRadio === 'onTheirOwn' || selectedRadio === 'attemptOnTheirOwn') return null
    if (personDeleted === 'true') return null
    if (newAssociatedPrisoner && newAssociatedPrisoner !== undefined) return newAssociatedPrisoner
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
    const { referrer } = req.query
    const { user } = res.locals
    const { personDeleted } = req.query
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')

    const IdNumberValue: number = parseInt(id as string, 10)

    const [prisoner, adjudicationDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      this.placeOnReportService.getDraftIncidentDetailsForEditing(IdNumberValue, user),
    ])
    req.session.originalAssociatedPrisonerNumber = adjudicationDetails.incidentRole.associatedPrisonersNumber

    const reporter = await this.placeOnReportService.getReporterName(adjudicationDetails.startedByUserId, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const radioButtonSelected = originalRadioSelection || incidentRoleToRadio(adjudicationDetails.incidentRole.roleCode)

    const associatedPrisonerNumber = this.getAssociatedPrisonerNumber(
      radioButtonSelected,
      adjudicationDetails.incidentRole.associatedPrisonersNumber,
      selectedPerson,
      personDeleted as string
    )

    const associatedPrisonerName = await this.getCurrentAssociatedPrisonerName(associatedPrisonerNumber, user)

    const data = {
      incidentDate: this.getIncidentDate(incidentDate) || this.getIncidentDate(adjudicationDetails.dateTime),
      locationId: locationId || adjudicationDetails.locationId,
      originalRadioSelection: radioButtonSelected,
      associatedPrisonerNumber,
      associatedPrisonerName,
    }

    const exitButtonHref = (referrer as string)?.includes('review')
      ? `/prisoner-report/${prisoner.prisonerNumber}/${adjudicationDetails.adjudicationNumber}/review`
      : `/prisoner-report/${prisoner.prisonerNumber}/${adjudicationDetails.adjudicationNumber}/report`

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisoner,
      locations,
      data,
      reportingOfficer: reporter || '',
      submitButtonText: 'Save and continue',
      exitButtonHref: exitButtonHref || '/place-a-prisoner-on-report',
      adjudicationNumber: adjudicationDetails.adjudicationNumber,
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
    delete req.session.redirectUrl
    delete req.session.originalAssociatedPrisonerNumber
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
    const { referrer, personDeleted } = req.query

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
      req.session.redirectUrl = `/incident-details/${prisonerNumber}/${id}/submitted/edit?referrer=${referrer}`
      req.session.originalRadioSelection = currentRadioSelected
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      return res.redirect(`/select-associated-prisoner?searchTerm=${searchValue}`)
    }

    const newlySelectedAssociatedPrisonersNumber =
      isPrisonerIdentifier(selectedPerson) && currentRadioSelected === originalRadioSelection ? selectedPerson : null

    const associatedPrisonersNumber = this.getAssociatedPrisonerNumber(
      currentRadioSelected,
      req.session.originalAssociatedPrisonerNumber,
      newlySelectedAssociatedPrisonersNumber,
      personDeleted as string
    )
    delete req.session.originalAssociatedPrisonerNumber

    if (deleteAssociatedPrisoner) {
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      req.session.redirectUrl = `/incident-details/${prisonerNumber}/${id}/submitted/edit?referrer=${referrer}`
      return res.redirect(`/delete-person?associatedPersonId=${associatedPrisonersNumber}`)
    }

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
      })

    const IdNumberValue: number = parseInt(id as string, 10)
    const nextPage = (referrer as string).includes('review')
      ? `/check-your-answers/${prisonerNumber}/${id}/review`
      : `/check-your-answers/${prisonerNumber}/${id}/report`

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

      return res.redirect(nextPage)
    } catch (postError) {
      logger.error(`Failed to post edited incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/place-a-prisoner-on-report`
      throw postError
    }
  }
}
