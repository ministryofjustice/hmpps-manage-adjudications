import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName, formatName } from '../../utils/utils'
import { DecisionForm } from './decisionForm'
import {
  decisionFormFromPost,
  getAndDeleteSessionDecisionForm,
  getRedirectUrlForUserSearch,
  setSessionDecisionForm,
  updateSessionDecisionForm,
} from './offenceCodeDecisionsSessionHelper'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { User } from '../../data/hmppsAuthClient'

type PageData = { errors?: FormError[] } & DecisionForm

export default class OffenceCodeRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { errors } = pageData
    const { user } = res.locals
    const decisionForm = pageData // The form backing this page
    const placeholderValues = await this.placeholderValues(adjudicationNumber, user)
    const decision = decisionTree.findByUrl(req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, ''))
    const pageTitle = decision.getTitle().getProcessedText(placeholderValues, incidentRole as IncidentRole)
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().getProcessedText(placeholderValues),
        type: d.getType().toString(),
      }
    })
    const selectedDecisionViewData = await this.viewDataFromDecisionForm(decisionForm, user)
    return res.render(`pages/offenceCodeDecisions`, {
      errors: errors || [],
      decisionForm,
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
      updateSessionDecisionForm(req, req.query.selectedPerson as string)
      return res.redirect(
        url.format({
          pathname: this.urlHere(req),
        })
      )
    }
    // We are viewing this page. If we have come from a user selection then we should have the previous state of the
    // form in the session, so we render that now and remove it from the session.
    return this.renderView(req, res, getAndDeleteSessionDecisionForm(req) || {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const decisionForm = decisionFormFromPost(req)
    const searching = !!req.body.searchUser // Is this a standard submit or are we searching for a user.
    const errors = validateForm(decisionForm, searching)

    if (errors) {
      return this.renderView(req, res, {
        errors,
        ...decisionForm,
      })
    }

    const selectedDecision = decisionTree.findById(decisionForm.selectedDecisionId)

    if (searching) {
      // We need to redirect the user to the search page, but before we do that we need to save the current data from
      // the session.
      setSessionDecisionForm(req, decisionForm)
      req.session.redirectUrl = this.urlHere(req) // TODO add functionality to allow simply passing a parameter in the redirect?
      return this.redirect(getRedirectUrlForUserSearch(decisionForm), res)
    }

    const redirectUrl = selectedDecision.getCode()
      ? `/TODO`
      : `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`

    return res.redirect(
      url.format({
        pathname: redirectUrl,
      })
    )
  }

  private async placeholderValues(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    const [prisonerDetails, associatedPrisoner] = await Promise.all([
      this.prisonerDetails(draftAdjudication.draftAdjudication.prisonerNumber, user),
      this.prisonerDetails(draftAdjudication.draftAdjudication?.incidentRole?.associatedPrisonersNumber, user),
    ])
    return {
      offenderFirstName: properCaseName(prisonerDetails?.firstName),
      offenderLastName: properCaseName(prisonerDetails?.lastName),
      assistedFirstName: properCaseName(associatedPrisoner?.firstName),
      assistedLastName: properCaseName(associatedPrisoner?.lastName),
    }
  }

  // If a member of staff or prisoner has been searched for then additional view data is displayed.
  private async viewDataFromDecisionForm(form: DecisionForm, user: User) {
    const userId = form?.selectedDecisionData?.userId // This could be a staff username or a prisoner number
    if (form?.selectedDecisionData?.userId) {
      switch (decisionTree.findById(form.selectedDecisionId).getType()) {
        case DecisionType.OFFICER:
        case DecisionType.STAFF: {
          const decisionStaff = await this.userService.getStaffFromUsername(userId, user)
          return { staffName: properCaseName(decisionStaff.name) }
        }
        case DecisionType.PRISONER: {
          const decisionPrisoner = await this.prisonerDetails(userId, user)
          return { prisonerName: formatName(decisionPrisoner.firstName, decisionPrisoner.lastName) }
        }
        default:
          break
      }
    }
    return {}
  }

  private async prisonerDetails(prisonerNumber: string, user: User) {
    if (prisonerNumber) {
      return this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    }
    return null
  }

  private redirect(pathAndQuery: { pathname: string; query: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(pathAndQuery))
  }

  private urlHere(req: Request) {
    return `/offence-code-selection${req.path}`
  }
}
