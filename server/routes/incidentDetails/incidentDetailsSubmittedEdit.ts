import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDate } from '../../utils/utils'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string
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

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentDate, locationId } = pageData
    const { prisonerNumber, id } = req.params
    const { referrer } = req.query
    const { user } = res.locals

    const IdNumberValue: number = parseInt(id as string, 10)

    const [prisoner, adjudicationDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      this.placeOnReportService.getDraftIncidentDetailsForEditing(IdNumberValue, user),
    ])
    const reporter = await this.placeOnReportService.getReporterName(adjudicationDetails.startedByUserId, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const location = error ? locationId : adjudicationDetails.locationId

    const data = {
      incidentDate: this.getIncidentDate(incidentDate) || this.getIncidentDate(adjudicationDetails.dateTime),
      locationId: location,
    }

    const cancelButtonHref = (referrer as string)?.includes('review')
      ? `/prisoner-report/${prisoner.prisonerNumber}/${adjudicationDetails.adjudicationNumber}/review`
      : `/prisoner-report/${prisoner.prisonerNumber}/${adjudicationDetails.adjudicationNumber}/report`

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisoner,
      locations,
      data,
      reportingOfficer: reporter || '',
      submitButtonText: 'Continue',
      cancelButtonHref: cancelButtonHref || '/place-a-prisoner-on-report',
      reportPreviouslySubmitted: true,
      adjudicationNumber: adjudicationDetails.adjudicationNumber,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentDate, locationId } = req.body
    const { user } = res.locals
    const { prisonerNumber, id } = req.params
    const { referrer } = req.query

    const error = validateForm({ incidentDate, locationId })
    if (error) return this.renderView(req, res, { error, incidentDate, locationId })

    const IdNumberValue: number = parseInt(id as string, 10)
    const nextPage = (referrer as string).includes('review')
      ? `/check-your-answers/${prisonerNumber}/${id}/review`
      : `/check-your-answers/${prisonerNumber}/${id}/report`

    try {
      this.placeOnReportService.editDraftIncidentDetails(IdNumberValue, formatDate(incidentDate), locationId, user)

      return res.redirect(nextPage)
    } catch (postError) {
      logger.error(`Failed to post edited incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/place-a-prisoner-on-report`
      throw postError
    }
  }
}
