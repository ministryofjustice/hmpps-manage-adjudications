import { Request, Response } from 'express'
import validateForm from './incidentDetailsValidation'
import { FormError, SubmittedDateTime } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import logger from '../../../logger'
import { formatDateToISOString } from '../../utils/utils'

type PageData = {
  error?: FormError | FormError[]
  incidentDate?: SubmittedDateTime
  locationId?: string
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
    const { error, incidentDate, locationId } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    const { agencyId } = prisoner.assignedLivingUnit
    const locations = await this.locationService.getIncidentLocations(agencyId, user)

    const data = {
      incidentDate: this.getIncidentDate(incidentDate),
      locationId,
    }

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisoner,
      locations,
      data,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentDate, locationId } = req.body
    const { user } = res.locals
    const { prisonerNumber } = req.params

    const error = validateForm({ incidentDate, locationId })
    if (error) return this.renderView(req, res, { error, incidentDate, locationId })

    const dateTimeOfIncident = formatDateToISOString(incidentDate)

    try {
      const newAdjudication = await this.placeOnReportService.startNewDraftAdjudication(
        dateTimeOfIncident,
        locationId,
        prisonerNumber,
        user
      )
      const { id } = newAdjudication.draftAdjudication
      return res.redirect(`/incident-statement/${prisonerNumber}/${id}`)
    } catch (postError) {
      logger.error(`Failed to post incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${prisonerNumber}`
      throw postError
    }
  }
}
