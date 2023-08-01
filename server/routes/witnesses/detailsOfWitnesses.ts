/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { User } from '../../data/hmppsAuthClient'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import DamagesEvidenceWitnessHelper from '../../utils/damagesEvidenceWitnessesHelper'

export enum PageRequestType {
  WITNESSES_FROM_API,
  WITNESSES_FROM_SESSION,
  SUBMITTED_EDIT_WITNESSES_FROM_API,
  SUBMITTED_EDIT_WITNESSES_FROM_SESSION,
}

class PageOptions extends DamagesEvidenceWitnessHelper {
  constructor(private readonly pageType: PageRequestType) {
    super()
  }

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
    const { chargeNumber } = req.params
    const witnessToDelete = Number(req.query.delete) || null
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()
    const exitButtonHref = this.getExitUrl(req, chargeNumber, isSubmittedEdit)
    const addWitnessUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfWitnesses.urls.add(chargeNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfWitnesses.urls.add(chargeNumber)}?submitted=false`
    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfWitnesses.urls.submittedEditModified(chargeNumber)}?delete=`
      : `${adjudicationUrls.detailsOfWitnesses.urls.modified(chargeNumber)}?delete=`

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(chargeNumber, isSubmittedEdit, user)
    const witnesses = this.getWitnesses(req, chargeNumber, adjudication)

    // If we are not displaying session data then fill in the session data
    if (this.pageOptions.isShowingAPIData()) {
      // Set up session to allow for adding and deleting
      this.witnessesSessionService.setAllSessionWitnesses(req, witnesses, chargeNumber)
    }

    if (witnessToDelete) {
      this.witnessesSessionService.deleteSessionWitness(req, witnessToDelete, chargeNumber)
    }

    // If the user cancelled out of adding a new witness, we need to make sure the session is cleared
    this.witnessesSessionService.deleteSubmittedEditFlagOnSession(req)

    if (!witnesses || witnesses.length < 1) {
      return res.render(`pages/detailsOfWitnesses`, {
        prisoner,
        exitButtonHref,
        addWitnessButtonHref: addWitnessUrl,
      })
    }
    return res.render(`pages/detailsOfWitnesses`, {
      currentUser: user.username,
      chargeNumber,
      witnesses,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addWitnessButtonHref: addWitnessUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()
    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(Number(chargeNumber), user)
      : null
    const referrer = this.witnessesSessionService.getAndDeleteReferrerOnSession(req)

    // If displaying data on draft, nothing has changed so no save needed  - unless it's the first time viewing the page, when we need to record that the page visit
    if (this.pageOptions.isShowingAPIDataAndPageVisited(draftAdjudicationResult?.draftAdjudication.witnessesSaved)) {
      this.witnessesSessionService.deleteAllSessionWitnesses(req, chargeNumber)
      return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
    }

    const witnessDetails = this.witnessesSessionService.getAndDeleteAllSessionWitnesses(req, chargeNumber) || []

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateWitnessDetails(chargeNumber, witnessDetails, user)
    } else {
      await this.placeOnReportService.saveWitnessDetails(chargeNumber, witnessDetails, user)
    }
    return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
  }

  getAdjudicationAndPrisoner = async (id: string, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      const draftId = Number(id)
      const [draftAdjudicationResult, prisoner] = await Promise.all([
        this.placeOnReportService.getDraftAdjudicationDetails(draftId, user),
        this.placeOnReportService.getPrisonerDetailsFromAdjNumber(draftId, user),
      ])
      const { draftAdjudication } = draftAdjudicationResult
      return { adjudication: draftAdjudication, prisoner }
    }
    const [reportedAdjudicationResult, prisoner] = await Promise.all([
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(id, user),
      this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(id, user),
    ])
    const { reportedAdjudication } = reportedAdjudicationResult
    return { adjudication: reportedAdjudication, prisoner }
  }

  getWitnesses = (req: Request, chargeNumber: string, adjudication: DraftAdjudication | ReportedAdjudication) => {
    if (this.pageOptions.isShowingSessionData()) {
      return this.witnessesSessionService.getAllSessionWitnesses(req, chargeNumber)
    }

    return adjudication.witnesses || []
  }

  getExitUrl = (req: Request, chargeNumber: string, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(chargeNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (prisonerReportUrl) this.witnessesSessionService.setReferrerOnSession(req, prisonerReportUrl, chargeNumber)
    return isSubmittedEdit ? this.witnessesSessionService.getReferrerFromSession(req) : taskListUrl
  }

  redirectToNextPage = async (
    res: Response,
    chargeNumber: string | number,
    isReportedDraft: boolean,
    referrer: string = null
  ) => {
    if (isReportedDraft) {
      return res.redirect(
        `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(
          chargeNumber as string
        )}?referrer=${referrer}`
      )
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(chargeNumber as number))
  }
}
