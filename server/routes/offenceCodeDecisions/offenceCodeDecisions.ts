import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'
import PlaceOnReportService from '../../services/placeOnReportService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName } from '../../utils/utils'

type PageData = {
  error?: FormError
  selectedDecisionId?: string
}

export default class OffenceCodeRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private async placeholderValues(adjudicationNumber: string, res: Response) {
    const { user } = res.locals
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    const prisonerDetails = await this.placeOnReportService.getPrisonerDetails(
      draftAdjudication.draftAdjudication.prisonerNumber,
      user
    )
    return {
      offenderFirstName: properCaseName(prisonerDetails.firstName),
      offenderLastName: properCaseName(prisonerDetails.lastName),
    }
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { error, selectedDecisionId } = pageData
    const placeholderValues = await this.placeholderValues(adjudicationNumber, res)
    const path = req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, '')
    const decision = decisionTree.findByUrl(path)

    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().getProcessedText(placeholderValues),
      }
    })
    return res.render(`pages/${decision.getPage() || 'offenceCodeDecisions'}`, {
      errors: error ? [error] : [],
      selectedDecisionId,
      questions,
      pageTitle,
      pageData,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { selectedDecisionId } = req.body

    const error = validateForm({ selectedDecisionId })

    if (error) {
      return this.renderView(req, res, {
        error,
        selectedDecisionId,
      })
    }

    const selectedDecision = decisionTree.findById(selectedDecisionId)
    const redirectUrl = selectedDecision.getCode()
      ? `/TODO`
      : `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`

    return res.redirect(
      url.format({
        pathname: redirectUrl,
      })
    )
  }
}
