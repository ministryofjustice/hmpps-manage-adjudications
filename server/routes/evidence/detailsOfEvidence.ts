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

export enum PageRequestType {
  EVIDENCE_FROM_API,
  EVIDENCE_FROM_SESSION,
  SUBMITTED_EDIT_EVIDENCE_FROM_API,
  SUBMITTED_EDIT_EVIDENCE_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const evidenceIndexToDelete = Number(req.query.delete) || null
    const evidenceTypeToDelete = (req.query.type as string) || null
    const isSubmittedEdit = this.pageOptions.displayAPIDataSubmitted() || this.pageOptions.displaySessionDataSubmitted()
    const exitButtonHref = this.getExitUrl(req, adjudicationNumber, isSubmittedEdit)

    const addEvidenceUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfEvidence.urls.add(adjudicationNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfEvidence.urls.add(adjudicationNumber)}?submitted=false`

    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(adjudicationNumber)}`
      : `${adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber)}`

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(adjudicationNumber, isSubmittedEdit, user)

    const evidence = this.getEvidence(req, adjudicationNumber, adjudication)
    const allEvidence = [...evidence.photoVideo, ...evidence.baggedAndTagged]

    // If we are not displaying session data then fill in the session data
    if (!this.pageOptions.displaySessionData()) {
      // Set up session to allow for adding and deleting
      this.evidenceSessionService.setAllSessionEvidence(req, evidence, adjudicationNumber)
    }

    if (evidenceIndexToDelete) {
      await this.evidenceSessionService.deleteSessionEvidence(
        req,
        evidenceIndexToDelete,
        evidenceTypeToDelete === EvidenceCode.BAGGED_AND_TAGGED,
        adjudicationNumber
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
      adjudicationNumber,
      evidence,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addEvidenceButtonHref: addEvidenceUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isSubmittedEdit = this.pageOptions.displaySessionDataSubmitted() || this.pageOptions.displayAPIDataSubmitted()

    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
      : null

    const referrer = this.evidenceSessionService.getAndDeleteReferrerOnSession(req)

    // If displaying data on draft, nothing has changed so no save needed - unless it's the first time viewing the page, when we need to record that the page visit
    if (
      (this.pageOptions.displayAPIData() && draftAdjudicationResult.draftAdjudication.evidenceSaved) ||
      this.pageOptions.displayAPIDataSubmitted()
    ) {
      this.evidenceSessionService.deleteReferrerOnSession(req)
      this.evidenceSessionService.deleteAllSessionEvidence(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isSubmittedEdit, referrer)
    }

    const evidenceDetails = this.evidenceSessionService.getAndDeleteAllSessionEvidence(req, adjudicationNumber)

    // we need to merge the different evidence types back together into one array
    const allEvidence = evidenceDetails ? [...evidenceDetails.photoVideo, ...evidenceDetails.baggedAndTagged] : []

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateEvidenceDetails(adjudicationNumber, allEvidence, user)
    } else {
      await this.placeOnReportService.saveEvidenceDetails(adjudicationNumber, allEvidence, user)
    }
    return this.redirectToNextPage(res, adjudicationNumber, isSubmittedEdit, referrer)
  }

  getEvidence = (req: Request, adjudicationNumber: number, adjudication: DraftAdjudication | ReportedAdjudication) => {
    if (this.pageOptions.displaySessionData() || this.pageOptions.displaySessionDataSubmitted()) {
      return this.evidenceSessionService.getAllSessionEvidence(req, adjudicationNumber)
    }

    const photoVideo = getEvidenceCategory(adjudication.evidence, false)
    const baggedAndTagged = getEvidenceCategory(adjudication.evidence, true)

    return {
      photoVideo,
      baggedAndTagged,
    }
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

  getExitUrl = (req: Request, adjudicationNumber: number, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (this.pageOptions.displayAPIDataSubmitted() && prisonerReportUrl)
      this.evidenceSessionService.setReferrerOnSession(req, prisonerReportUrl, adjudicationNumber)
    return isSubmittedEdit ? this.evidenceSessionService.getReferrerFromSession(req) : taskListUrl
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number, isSubmittedEdit: boolean, referrer: string) => {
    if (isSubmittedEdit)
      return res.redirect(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(adjudicationNumber)}?referrer=${referrer}`
      )
    return res.redirect(adjudicationUrls.detailsOfWitnesses.urls.start(adjudicationNumber))
  }
}
