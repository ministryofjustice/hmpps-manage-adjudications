/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication, EvidenceCode } from '../../data/DraftAdjudicationResult'
import { getEvidenceCategory } from '../../utils/utils'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { User } from '../../data/hmppsAuthClient'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import DamagesEvidenceWitnessHelper from '../../utils/damagesEvidenceWitnessesHelper'

export enum PageRequestType {
  EVIDENCE_FROM_API,
  EVIDENCE_FROM_SESSION,
  SUBMITTED_EDIT_EVIDENCE_FROM_API,
  SUBMITTED_EDIT_EVIDENCE_FROM_SESSION,
}

class PageOptions extends DamagesEvidenceWitnessHelper {
  constructor(private readonly pageType: PageRequestType) {
    super()
  }

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.EVIDENCE_FROM_API
  }

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.EVIDENCE_FROM_SESSION
  }

  displayAPIDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_EVIDENCE_FROM_API
  }

  displaySessionDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_EVIDENCE_FROM_SESSION
  }
}

export default class DetailsOfEvidencePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly evidenceSessionService: EvidenceSessionService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const evidenceIndexToDelete = Number(req.query.delete) || null
    const evidenceTypeToDelete = (req.query.type as string) || null
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()
    const exitButtonHref = this.getExitUrl(req, chargeNumber, isSubmittedEdit)

    const addEvidenceUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfEvidence.urls.add(chargeNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfEvidence.urls.add(chargeNumber)}?submitted=false`

    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(chargeNumber)}`
      : `${adjudicationUrls.detailsOfEvidence.urls.modified(chargeNumber)}`

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(chargeNumber, isSubmittedEdit, user)

    const evidence = this.getEvidence(req, chargeNumber, adjudication)
    const allEvidence = [...evidence.photoVideo, ...evidence.baggedAndTagged]

    // If we are not displaying session data then fill in the session data
    if (this.pageOptions.isShowingAPIData()) {
      // Set up session to allow for adding and deleting
      this.evidenceSessionService.setAllSessionEvidence(req, evidence, chargeNumber)
    }

    if (evidenceIndexToDelete) {
      await this.evidenceSessionService.deleteSessionEvidence(
        req,
        evidenceIndexToDelete,
        evidenceTypeToDelete === EvidenceCode.BAGGED_AND_TAGGED,
        chargeNumber
      )
    }

    if (!allEvidence || allEvidence.length < 1) {
      return res.render(`pages/detailsOfEvidence`, {
        evidence,
        prisoner,
        exitButtonHref,
        addEvidenceButtonHref: addEvidenceUrl,
      })
    }

    return res.render(`pages/detailsOfEvidence`, {
      currentUser: user.username,
      chargeNumber,
      evidence,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addEvidenceButtonHref: addEvidenceUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()
    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(Number(chargeNumber), user)
      : null

    const referrer = this.evidenceSessionService.getAndDeleteReferrerOnSession(req)

    // If displaying data on draft, nothing has changed so no save needed - unless it's the first time viewing the page, when we need to record that the page visit
    if (this.pageOptions.isShowingAPIDataAndPageVisited(draftAdjudicationResult?.draftAdjudication.evidenceSaved)) {
      this.evidenceSessionService.deleteReferrerOnSession(req)
      this.evidenceSessionService.deleteAllSessionEvidence(req, chargeNumber)
      return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
    }

    const evidenceDetails = this.evidenceSessionService.getAndDeleteAllSessionEvidence(req, chargeNumber)

    // we need to merge the different evidence types back together into one array
    const allEvidence = evidenceDetails ? [...evidenceDetails.photoVideo, ...evidenceDetails.baggedAndTagged] : []

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateEvidenceDetails(chargeNumber, allEvidence, user)
    } else {
      await this.placeOnReportService.saveEvidenceDetails(chargeNumber, allEvidence, user)
    }
    return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
  }

  getEvidence = (req: Request, chargeNumber: string, adjudication: DraftAdjudication | ReportedAdjudication) => {
    if (this.pageOptions.isShowingSessionData()) {
      return this.evidenceSessionService.getAllSessionEvidence(req, chargeNumber)
    }

    const photoVideo = getEvidenceCategory(adjudication.evidence, false)
    const baggedAndTagged = getEvidenceCategory(adjudication.evidence, true)

    return {
      photoVideo,
      baggedAndTagged,
    }
  }

  getAdjudicationAndPrisoner = async (chargeNumber: string, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      const chargeNo = Number(chargeNumber)
      const [draftAdjudicationResult, prisoner] = await Promise.all([
        this.placeOnReportService.getDraftAdjudicationDetails(chargeNo, user),
        this.placeOnReportService.getPrisonerDetailsFromAdjNumber(chargeNo, user),
      ])
      const { draftAdjudication } = draftAdjudicationResult
      return { adjudication: draftAdjudication, prisoner }
    }
    const [reportedAdjudicationResult, prisoner] = await Promise.all([
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user),
      this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(chargeNumber, user),
    ])
    const { reportedAdjudication } = reportedAdjudicationResult
    return { adjudication: reportedAdjudication, prisoner }
  }

  getExitUrl = (req: Request, chargeNumber: string, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(chargeNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (this.pageOptions.displayAPIDataSubmitted() && prisonerReportUrl)
      this.evidenceSessionService.setReferrerOnSession(req, prisonerReportUrl, chargeNumber)
    return isSubmittedEdit ? this.evidenceSessionService.getReferrerFromSession(req) : taskListUrl
  }

  redirectToNextPage = (res: Response, chargeNumber: string, isSubmittedEdit: boolean, referrer: string) => {
    if (isSubmittedEdit)
      return res.redirect(
        `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(chargeNumber)}?referrer=${referrer}`
      )
    return res.redirect(adjudicationUrls.detailsOfWitnesses.urls.start(chargeNumber))
  }
}
