import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'
import PlaceOnReportService from '../../services/placeOnReportService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName } from '../../utils/utils'
import { DecisionForm } from './decisionForm'
import {
  decisionFormFromPost,
  getAndDeleteSessionDecisionForm,
  setSessionDecisionForm,
  updateSessionDecisionForm,
  viewDataFromDecisionForm,
} from './offenceCodeDecisionsSessionHelper'

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
    const { error } = pageData
    const decisionFormData = pageData
    const selectedDecisionViewData = viewDataFromDecisionForm(decisionFormData)

    const placeholderValues = await this.placeholderValues(adjudicationNumber, res)
    const path = req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, '')
    const decision = decisionTree.findByUrl(path)

    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().getProcessedText(placeholderValues),
        type: d.getType().toString(),
      }
    })
    return res.render(`pages/offenceCodeDecisions`, {
      errors: error ? [error] : [],
      decisionFormData,
      selectedDecisionViewData,
      questions,
      pageTitle,
      pageData,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    if (req.query.selectedPerson) {
      // We are coming back from a user selection. We want to record this in the DecisionForm stored on the session and
      // then redirect to the view page after removing the request parameter.
      updateSessionDecisionForm(res, req.query.selectedPerson[0])
      return res.redirect(
        url.format({
          pathname: `/offence-code-selection${req.path}`,
        })
      )
    }
    // We are viewing this page. If we have come from a user selection then we should have the previous state of the
    // form in the session, so we render that now and remove it from the session.
    return this.renderView(req, res, getAndDeleteSessionDecisionForm(res) || {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const decisionForm = decisionFormFromPost(req)

    if (req.body.searchUser) {
      // We need to redirect the user to the search page, but before we do that we need to save the current data from
      // the session.
      setSessionDecisionForm(res, decisionForm)
      return res.redirect(
        url.format({
          pathname: 'TODO',
        })
      )
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
