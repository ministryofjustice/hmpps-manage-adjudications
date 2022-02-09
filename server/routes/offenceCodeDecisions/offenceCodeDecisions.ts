import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'
import PlaceOnReportService from '../../services/placeOnReportService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName } from '../../utils/utils'
import { DecisionForm } from './decisionForm'

type PageData = { error?: FormError } & DecisionForm

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
      assistedFirstName: 'TODO',
      assistedLastName: 'TODO',
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
    return res.render(`pages/offenceCodeDecisions`, {
      errors: error ? [error] : [],
      selectedDecisionId,
      questions,
      pageTitle,
      pageData,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    if (req.query.selectedPerson) {
      // We are coming back from a user selection. We want to record this in the DecisionForm stored on the session and
      // then redirect to view page to render. TODO should this be in a helper route / class
      const sessionDecisionForm = (res.locals.sessionDecisionForm || {}) as DecisionForm
      sessionDecisionForm.userLookup = req.params.selectedPerson
      return res.redirect(
        url.format({
          pathname: `/offence-code-selection${req.path}`,
        })
      )
    }
    // We are viewing this page. If we have come from a user lookup then we should have the previous state of the form
    // In the session, so we render that now and remove it from the session.
    const sessionDecisionForm = res.locals.sessionDecisionForm as DecisionForm
    res.locals.sessionDecisionForm = null
    return this.renderView(req, res, sessionDecisionForm || {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { selectedDecisionId } = req.body
    const userLookup = req.body[`${selectedDecisionId}userLookup`]
    const decisionForm = {
      selectedDecisionId,
      userLookup,
    }

    const error = validateForm(decisionForm)

    if (error) {
      return this.renderView(req, res, {
        error,
        ...decisionForm,
      })
    }

    const selectedDecision = decisionTree.findById(decisionForm.selectedDecisionId)
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
