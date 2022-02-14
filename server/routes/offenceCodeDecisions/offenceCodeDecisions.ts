import { Request, Response } from 'express'
import url from 'url'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import IncidentRole from '../../incidentRole/IncidentRole'
import { properCaseName, formatName } from '../../utils/utils'
import { DecisionForm, OfficerData, PrisonerData, StaffData } from './decisionForm'
import {
  decisionFormFromPost,
  getAndDeleteSessionDecisionForm,
  getRedirectUrlForUserSearch,
  setSessionDecisionForm,
  updateSessionDecisionForm,
} from './offenceCodeDecisionsSessionHelper'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { User } from '../../data/hmppsAuthClient'

type PageData = { errors?: FormError[]; adjudicationNumber: string; incidentRole: string } & DecisionForm

export default class OffenceCodeRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole, errors } = pageData
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
    const { adjudicationNumber, incidentRole } = req.params
    if (req.query.selectedPerson) {
      // We are coming back from a user selection. We want to record this in the DecisionForm stored on the session and
      // then redirect to the view page after removing the request parameter.
      updateSessionDecisionForm(req, req.query.selectedPerson as string, adjudicationNumber)
      return this.redirect(this.urlHere(req), res)
    }
    // We are viewing this page. If we have come from a user selection then we should have the previous state of the
    // form in the session, so we render that now and remove it from the session.
    return this.renderView(req, res, {
      ...(getAndDeleteSessionDecisionForm(req, adjudicationNumber) || {}),
      adjudicationNumber,
      incidentRole,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { user } = res.locals
    const searching = !!req.body.searchUser // Are we searching for a user?
    const cancel = !!req.body.decisionFormCancel // Are we cancelling the flow?
    const deleteUser = !!req.body.deleteUser // Are we removing a selected user?

    if (cancel) {
      const prisonerNumber = await this.getPrisonerNumberFromDraftAdjudicationNumber(adjudicationNumber, user)
      return this.redirect(`/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`, res)
    }
    if (deleteUser) {
      return this.redirect(this.urlHere(req), res)
    }

    // Now we need to know about what else has been posted.
    const decisionForm = decisionFormFromPost(req)
    const errors = validateForm(decisionForm, searching)

    if (errors && errors.length !== 0) {
      return this.renderView(req, res, { errors, ...decisionForm, adjudicationNumber, incidentRole })
    }

    const selectedDecision = decisionTree.findById(decisionForm.selectedDecisionId)

    if (searching) {
      // We need to redirect the user to the search page, but before we do that we need to save the current data from
      // the session.
      setSessionDecisionForm(req, decisionForm, adjudicationNumber)
      req.session.redirectUrl = this.urlHere(req) // TODO add functionality to allow simply passing a parameter in the redirect?
      return this.redirect(getRedirectUrlForUserSearch(decisionForm), res)
    }

    const redirectUrl = selectedDecision.getCode()
      ? `/TODO`
      : `/offence-code-selection/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`

    return this.redirect(redirectUrl, res)
  }

  // This information is used to fill out specific details in questions and titles.
  private async placeholderValues(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.getDraftAdjudication(adjudicationNumber, user)
    const [prisonerDetails, associatedPrisoner] = await Promise.all([
      this.getPrisonerDetails(draftAdjudication.prisonerNumber, user),
      this.getPrisonerDetails(draftAdjudication?.incidentRole?.associatedPrisonersNumber, user),
    ])
    return {
      offenderFirstName: properCaseName(prisonerDetails?.firstName),
      offenderLastName: properCaseName(prisonerDetails?.lastName),
      assistedFirstName: properCaseName(associatedPrisoner?.firstName),
      assistedLastName: properCaseName(associatedPrisoner?.lastName),
    }
  }

  private async getPrisonerNumberFromDraftAdjudicationNumber(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.getDraftAdjudication(adjudicationNumber, user)
    const prisonerDetails = await this.getPrisonerDetails(draftAdjudication.prisonerNumber, user)
    return prisonerDetails.prisonerNumber
  }

  // If an officer, member of staff or prisoner has been searched for then additional view data is displayed.
  private async viewDataFromDecisionForm(form: DecisionForm, user: User) {
    if (form?.selectedDecisionData) {
      switch (decisionTree.findById(form.selectedDecisionId).getType()) {
        case DecisionType.OFFICER:
          {
            const officerId = (form.selectedDecisionData as OfficerData)?.officerId
            if (officerId) {
              const decisionOfficer = await this.userService.getStaffFromUsername(officerId, user)
              return { officerName: properCaseName(decisionOfficer.name) }
            }
          }
          break
        case DecisionType.STAFF:
          {
            const staffId = (form.selectedDecisionData as StaffData)?.staffId
            if (staffId) {
              const decisionStaff = await this.userService.getStaffFromUsername(staffId, user)
              return { staffName: properCaseName(decisionStaff.name) }
            }
          }
          break
        case DecisionType.PRISONER:
          {
            const prisonerId = (form.selectedDecisionData as PrisonerData)?.prisonerId
            if (prisonerId) {
              const decisionPrisoner = await this.getPrisonerDetails(prisonerId, user)
              return { prisonerName: formatName(decisionPrisoner.firstName, decisionPrisoner.lastName) }
            }
          }
          break
        default:
          break
      }
    }
    return {}
  }

  private async getPrisonerDetails(prisonerNumber: string, user: User) {
    if (prisonerNumber) {
      return this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    }
    return null
  }

  private async getDraftAdjudication(adjudicationNumber: string, user: User) {
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    return draftAdjudication?.draftAdjudication
  }

  private redirect(pathAndQuery: { pathname: string; query?: { [key: string]: string } } | string, res: Response) {
    if (typeof pathAndQuery === 'string') {
      return res.redirect(pathAndQuery)
    }
    return res.redirect(url.format(pathAndQuery))
  }

  private urlHere(req: Request) {
    return `/offence-code-selection${req.path}`
  }
}
