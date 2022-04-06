import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'
import { checkYourAnswers, prisonerReport } from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisoner?: PrisonerResult
  adjudicationNumber?: number
  prisonerReportUrl?: string
}

export default class IncidentStatementSubmittedEditRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentStatement, adjudicationNumber, prisoner } = pageData

    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
      prisoner,
      incidentStatement,
      adjudicationEdited: true,
      submitButtonText: 'Continue',
      adjudicationNumber,
      prisonerReportUrl: prisonerReport.urls.report(adjudicationNumber),
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
      adjudicationNumber: draftAdjudication.adjudicationNumber,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement } = req.body
    const { user } = res.locals
    const { adjudicationNumber } = req.params

    const error = validateForm({ incidentStatement, incidentStatementComplete: 'yes', adjudicationEdited: true })
    if (error) return this.renderView(req, res, { error, incidentStatement })

    const adjudicationNumberValue = Number(adjudicationNumber)

    try {
      await this.placeOnReportService.addOrUpdateDraftIncidentStatement(
        adjudicationNumberValue,
        incidentStatement,
        true,
        user
      )

      return res.redirect(checkYourAnswers.urls.report(adjudicationNumberValue))
    } catch (postError) {
      logger.error(`Failed to post the edited incident statement for adjudication: ${postError}`)
      res.locals.redirectUrl = checkYourAnswers.urls.report(adjudicationNumberValue)
      throw postError
    }
  }
}
