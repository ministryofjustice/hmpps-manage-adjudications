/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { User } from '../../data/hmppsAuthClient'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  WITNESSES_FROM_API,
  WITNESSES_FROM_SESSION,
  SUBMITTED_EDIT_WITNESSES_FROM_API,
  SUBMITTED_EDIT_WITNESSES_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.WITNESSES_FROM_API
  }

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.WITNESSES_FROM_SESSION
  }

  displayAPIDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_WITNESSES_FROM_API
  }

  displaySessionDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_WITNESSES_FROM_SESSION
  }
}

export default class DetailsOfWitnessesPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly witnessesSessionService: WitnessesSessionService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const witnessToDelete = Number(req.query.delete) || null
    const isSubmittedEdit = this.pageOptions.displayAPIDataSubmitted() || this.pageOptions.displaySessionDataSubmitted()
    const exitButtonHref = this.getExitUrl(req, adjudicationNumber, isSubmittedEdit)
    const addWitnessUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfWitnesses.urls.add(adjudicationNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfWitnesses.urls.add(adjudicationNumber)}?submitted=false`
    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfWitnesses.urls.submittedEditModified(adjudicationNumber)}?delete=`
      : `${adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber)}?delete=`

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(adjudicationNumber, isSubmittedEdit, user)
    const witnesses = this.getWitnesses(req, adjudicationNumber, adjudication)

    // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData() || this.pageOptions.displayAPIDataSubmitted()) {
      // Set up session to allow for adding and deleting
      this.witnessesSessionService.setAllSessionWitnesses(req, witnesses, adjudicationNumber)
    }

    if (witnessToDelete) {
      this.witnessesSessionService.deleteSessionWitness(req, witnessToDelete, adjudicationNumber)
    }

    if (!witnesses || witnesses.length < 1) {
      return res.render(`pages/detailsOfWitnesses`, {
        prisoner,
        exitButtonHref,
        addWitnessButtonHref: addWitnessUrl,
      })
    }

    return res.render(`pages/detailsOfWitnesses`, {
      currentUser: user.username,
      adjudicationNumber,
      witnesses,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addWitnessButtonHref: addWitnessUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isSubmittedEdit = this.pageOptions.displaySessionDataSubmitted() || this.pageOptions.displayAPIDataSubmitted()
    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
      : null
    const referrer = this.witnessesSessionService.getAndDeleteReferrerOnSession(req)

    // If displaying data on draft, nothing has changed so no save needed  - unless it's the first time viewing the page, when we need to record that the page visit
    if (
      (this.pageOptions.displayAPIData() && draftAdjudicationResult.draftAdjudication.witnessesSaved) ||
      this.pageOptions.displayAPIDataSubmitted()
    ) {
      this.witnessesSessionService.deleteSubmittedEditFlagOnSession(req)
      this.witnessesSessionService.deleteAllSessionWitnesses(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isSubmittedEdit, referrer)
    }

    const witnessDetails = this.witnessesSessionService.getAndDeleteAllSessionWitnesses(req, adjudicationNumber) || []

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateWitnessDetails(adjudicationNumber, witnessDetails, user)
    } else {
      await this.placeOnReportService.saveWitnessDetails(adjudicationNumber, witnessDetails, user)
    }
    return this.redirectToNextPage(res, adjudicationNumber, isSubmittedEdit, referrer)
  }

  getAdjudicationAndPrisoner = async (adjudicationNumber: number, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      const [draftAdjudicationResult, prisoner] = await Promise.all([
        this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user),
        this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
      ])
      const { draftAdjudication } = draftAdjudicationResult
      return { adjudication: draftAdjudication, prisoner }
    }
    const [reportedAdjudicationResult, prisoner] = await Promise.all([
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(adjudicationNumber, user),
      this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
    ])
    const { reportedAdjudication } = reportedAdjudicationResult
    return { adjudication: reportedAdjudication, prisoner }
  }

  getWitnesses = (req: Request, adjudicationNumber: number, adjudication: DraftAdjudication | ReportedAdjudication) => {
    if (this.pageOptions.displaySessionData() || this.pageOptions.displaySessionDataSubmitted()) {
      return this.witnessesSessionService.getAllSessionWitnesses(req, adjudicationNumber)
    }

    return adjudication.witnesses || []
  }

  getExitUrl = (req: Request, adjudicationNumber: number, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (prisonerReportUrl) this.witnessesSessionService.setReferrerOnSession(req, prisonerReportUrl)
    return isSubmittedEdit ? this.witnessesSessionService.getReferrerFromSession(req) : taskListUrl
  }

  redirectToNextPage = async (
    res: Response,
    adjudicationNumber: number,
    isReportedDraft: boolean,
    referrer: string = null
  ) => {
    if (isReportedDraft) {
      return res.redirect(referrer)
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
