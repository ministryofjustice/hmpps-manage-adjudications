import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import { taskList } from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisoner?: PrisonerResult
}

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentStatement, incidentStatementComplete, prisoner } = pageData

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
    const { adjudicationNumber } = req.params
    const { user } = res.locals

    const draftAdjudicationResult = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    const { draftAdjudication } = draftAdjudicationResult
    const prisoner = await this.placeOnReportService.getPrisonerDetails(draftAdjudication.prisonerNumber, user)

    return this.renderView(req, res, {
      prisoner,
      incidentStatement: draftAdjudication.incidentStatement?.statement,
      incidentStatementComplete: draftAdjudication.incidentStatement?.completed ? 'yes' : null,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement, incidentStatementComplete } = req.body
    const { user } = res.locals
    const { adjudicationNumber } = req.params

    const error = validateForm({ incidentStatement, incidentStatementComplete })
    if (error) return this.renderView(req, res, { error, incidentStatement, incidentStatementComplete })

    const statementComplete: boolean = incidentStatementComplete === 'yes'

    try {
      const draftAdjudicationResult = await this.placeOnReportService.addOrUpdateDraftIncidentStatement(
        Number(adjudicationNumber),
        incidentStatement,
        statementComplete,
        user
      )
      const { draftAdjudication } = draftAdjudicationResult

      const pathname = this.getNextPage(statementComplete, draftAdjudication)
      return res.redirect(pathname)
    } catch (postError) {
      logger.error(`Failed to post incident statement for draft adjudication: ${postError}`)
      res.locals.redirectUrl = `/incident-statement/${adjudicationNumber}`
      throw postError
    }
  }

  getNextPage = (incidentStatementComplete: boolean, draftAdjudication: DraftAdjudication) => {
    if (incidentStatementComplete && draftAdjudication.offenceDetails.length)
      return `/check-your-answers/${draftAdjudication.id}`
    return taskList.urls.start(draftAdjudication.id)
  }
}
