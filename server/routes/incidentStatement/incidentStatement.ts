import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisonerData?: PrisonerResult
}

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentStatement, incidentStatementComplete } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
      prisoner,
      incidentStatement,
      incidentStatementComplete,
      adjudicationEdited: false,
      submitButtonText: 'Save and continue',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { user } = res.locals

    const draftAdjudicationResult = await this.placeOnReportService.getDraftAdjudicationDetails(Number(id), user)

    return this.renderView(req, res, {
      incidentStatement: draftAdjudicationResult?.draftAdjudication.incidentStatement?.statement,
      incidentStatementComplete: draftAdjudicationResult?.draftAdjudication.incidentStatement?.completed ? 'yes' : null,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement, incidentStatementComplete } = req.body
    const { user } = res.locals
    const { id, prisonerNumber } = req.params

    const error = validateForm({ incidentStatement, incidentStatementComplete })
    if (error) return this.renderView(req, res, { error, incidentStatement, incidentStatementComplete })

    try {
      const draftAdjudicationResult = await this.placeOnReportService.addOrUpdateDraftIncidentStatement(
        Number(id),
        incidentStatement,
        incidentStatementComplete === 'yes',
        user
      )
      const { draftAdjudication } = draftAdjudicationResult

      const pathname = this.getNextPage(incidentStatementComplete === 'yes', draftAdjudication)
      return res.redirect(pathname)
    } catch (postError) {
      logger.error(`Failed to post incident statement for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${prisonerNumber}/${id}`
      throw postError
    }
  }

  getNextPage = (incidentStatementComplete: boolean, draftAdjudication: DraftAdjudication) => {
    if (incidentStatementComplete) {
      if (draftAdjudication.offenceDetails.length)
        return `/check-your-answers/${draftAdjudication.prisonerNumber}/${draftAdjudication.id}`
    }
    return `/place-the-prisoner-on-report/${draftAdjudication.prisonerNumber}/${draftAdjudication.id}`
  }
}
