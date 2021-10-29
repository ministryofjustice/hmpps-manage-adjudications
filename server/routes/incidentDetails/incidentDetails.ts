import { Request, Response } from 'express'
// import validateForm from './incidentDetailsValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'

type PageData = {
  error?: FormError
  incidentDate?: string
  incidentTime?: string
  incidentLocation?: string
  prisonerData?: PrisonerResult
}

export default class IncidentDetailsRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    // const { prisonerNumber } = req.session
    const prisonerNumber = 'G6415GD' // fix until we can get hold of the searched PRN
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/incidentDetails`, {
      errors: error ? [error] : [],
      prisoner,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentDate, incidentTime, incidentLocation } = req.body
    const { user } = res.locals

    // const { prisonerNumber } = req.session
    const prisonerNumber = 'G6415GD' // fix until we can get hold of the searched PRN

    // const error = validateForm({ incidentDate, incidentTime, incidentLocation })
    // if (error) return this.renderView(req, res, { error })

    // create IncidentDateTime from incidentDate and incidentTime
    const dateTimeObj = new Date(`${incidentDate} ${incidentTime}`)
    const IncidentDateTime = dateTimeObj.toISOString()

    try {
      await this.placeOnReportService.startNewDraftAdjudication(
        IncidentDateTime,
        incidentLocation,
        prisonerNumber,
        user
      )
      return res.redirect('/incident-statement')
    } catch (postError) {
      logger.error(`Failed to post incident details for draft adjudication: ${postError}`)
      res.locals.redirectUrl = '/incident-details'
      throw postError
    }
  }
}
