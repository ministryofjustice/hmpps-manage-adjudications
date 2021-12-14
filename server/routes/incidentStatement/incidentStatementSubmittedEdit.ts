import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisonerData?: PrisonerResult
  adjudicationNumber?: number
}

export default class IncidentStatementSubmittedEditRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentStatement, adjudicationNumber } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
      prisoner,
      incidentStatement,
      adjudicationEdited: true,
      submitButtonText: 'Continue',
      adjudicationNumber,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { user } = res.locals

    const draftAdjudicationResult = await this.placeOnReportService.getDraftAdjudicationDetails(Number(id), user)
    const { draftAdjudication } = draftAdjudicationResult

    return this.renderView(req, res, {
      incidentStatement: draftAdjudication.incidentStatement?.statement,
      adjudicationNumber: draftAdjudication.adjudicationNumber,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement } = req.body
    const { user } = res.locals
    const { id, prisonerNumber } = req.params

    const error = validateForm({ incidentStatement, incidentStatementComplete: 'yes', adjudicationEdited: true })
    if (error) return this.renderView(req, res, { error, incidentStatement })

    try {
      await this.placeOnReportService.addOrUpdateDraftIncidentStatement(Number(id), incidentStatement, true, user)

      return res.redirect(`/check-your-answers/${prisonerNumber}/${id}/report`)
    } catch (postError) {
      logger.error(`Failed to post the edited incident statement for adjudication: ${postError}`)
      res.locals.redirectUrl = `/check-your-answers/${prisonerNumber}/${id}/report`
      throw postError
    }
  }
}
