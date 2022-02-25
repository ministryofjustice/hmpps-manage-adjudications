import { Request, Response } from 'express'
import validatePrisonerSearch from './incidentDetailsSearchValidation'
import validateForm from './incidentDetailsValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'
import { User } from '../../data/hmppsAuthClient'
import { isPrisonerIdentifier } from '../../services/prisonerSearchService'
import { codeFromIncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'

type PageData = {
  error?: FormError
  incidentDate?: SubmittedDateTime
  locationId?: string
  originalRadioSelection?: string
  incitedInput?: string
  assistedInput?: string
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

  private getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (associatedPrisonersNumber === null) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }

  private getAssociatedPrisonersNumber = (
    selectedRadio: string,
    previouslyReportedAssociatedPrisoner: string,
    newAssociatedPrisoner: string,
    personDeleted: string,
    radioButtonChanged: boolean,
    prnError: boolean
  ): string => {
    if (selectedRadio === 'onTheirOwn' || selectedRadio === 'attemptOnTheirOwn') return null
    if (personDeleted === 'true') return null
    if (newAssociatedPrisoner && newAssociatedPrisoner !== undefined) return newAssociatedPrisoner
    if (radioButtonChanged || prnError) return null // if the user has changed the radio button and not searched for a new prisoner, this will disregard their previously selected prisoner and render an empty field - prnError is for VIEW and radioButtonChanged is for SUBMIT
    if (previouslyReportedAssociatedPrisoner !== undefined) return previouslyReportedAssociatedPrisoner
    return null
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentDate, locationId, incitedInput, assistedInput, originalRadioSelection } = pageData
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
    req.session.originalAssociatedPrisonersNumber = adjudicationDetails.incidentRole.associatedPrisonersNumber
    req.session.originalRadioSelection = incidentRoleFromCode(adjudicationDetails.incidentRole.roleCode)

    const reporter = await this.placeOnReportService.getReporterName(adjudicationDetails.startedByUserId, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const radioButtonSelected =
      originalRadioSelection || incidentRoleFromCode(adjudicationDetails.incidentRole.roleCode)
    const prnError = error && error.href.includes('AnotherPrisoner')

    const associatedPrisonersNumber = this.getAssociatedPrisonersNumber(
      radioButtonSelected,
      adjudicationDetails.incidentRole.associatedPrisonersNumber,
      selectedPerson,
      personDeleted as string,
      null,
      prnError
    )

    const associatedPrisonersName = await this.getCurrentAssociatedPrisonersName(associatedPrisonersNumber, user)

    const data = {
      incidentDate: this.getIncidentDate(incidentDate) || this.getIncidentDate(adjudicationDetails.dateTime),
      locationId: locationId || adjudicationDetails.locationId,
      originalRadioSelection: radioButtonSelected,
      associatedPrisonersNumber,
      associatedPrisonersName,
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
      incitedInput,
      assistedInput,
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
    delete req.session.originalAssociatedPrisonersNumber
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
    const { prisonerNumber, id } = req.params
    const selectedPerson = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    const { referrer, personDeleted } = req.query

    const originalRadioSelection =
      req.session.originalRadioSelection || incidentRoleFromCode(req.session.originalRadioSelection)

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
      req.session.redirectUrl = `/incident-details/${prisonerNumber}/${id}/submitted/edit?referrer=${referrer}`
      req.session.originalRadioSelection = currentRadioSelected
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      return res.redirect(`/select-associated-prisoner?searchTerm=${searchValue}`)
    }

    const newlySelectedAssociatedPrisonersNumber = isPrisonerIdentifier(selectedPerson) && selectedPerson

    const radioButtonChanged = currentRadioSelected !== originalRadioSelection
    const associatedPrisonersNumber = this.getAssociatedPrisonersNumber(
      currentRadioSelected,
      req.session.originalAssociatedPrisonersNumber,
      newlySelectedAssociatedPrisonersNumber,
      personDeleted as string,
      radioButtonChanged,
      null
    )
    delete req.session.originalAssociatedPrisonersNumber

    if (deleteAssociatedPrisoner) {
      req.session.incidentDate = incidentDate
      req.session.incidentLocation = locationId
      req.session.redirectUrl = `/incident-details/${prisonerNumber}/${id}/submitted/edit?referrer=${referrer}`
      req.session.originalRadioSelection = currentRadioSelected
      const prisonerToDelete = associatedPrisonersNumber || selectedPerson
      return res.redirect(`/delete-person?associatedPersonId=${prisonerToDelete}`)
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

    const incidentRoleCode = codeFromIncidentRole(currentRadioSelected)
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
