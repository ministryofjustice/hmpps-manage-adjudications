import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'
import logger from '../../../logger'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisoner?: PrisonerResult
  chargeNumber?: string
}

export default class IncidentStatementSubmittedEditRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, incidentStatement, chargeNumber, prisoner } = pageData

    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
      prisoner,
      incidentStatement,
      adjudicationEdited: true,
      submitButtonText: 'Continue',
      chargeNumber,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals

    const draftAdjudicationResult = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)
    const { draftAdjudication } = draftAdjudicationResult
    const prisoner = await this.placeOnReportService.getPrisonerDetails(draftAdjudication.prisonerNumber, user)

    return this.renderView(req, res, {
      prisoner,
      incidentStatement: draftAdjudication.incidentStatement?.statement,
      chargeNumber: draftAdjudication.chargeNumber,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement } = req.body
    const { user } = res.locals
    const draftId = Number(req.params.draftId)

    const error = validateForm({ incidentStatement, incidentStatementComplete: 'yes', adjudicationEdited: true })
    if (error) return this.renderView(req, res, { error, incidentStatement })

    try {
      await this.placeOnReportService.addOrUpdateDraftIncidentStatement(draftId, incidentStatement, true, user)

      return res.redirect(adjudicationUrls.checkYourAnswers.urls.report(draftId))
    } catch (postError) {
      logger.error(`Failed to post the edited incident statement for adjudication: ${postError}`)
      res.locals.redirectUrl = adjudicationUrls.checkYourAnswers.urls.report(draftId)
      throw postError
    }
  }
}
