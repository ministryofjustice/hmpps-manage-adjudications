/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication, EvidenceCode, EvidenceDetails } from '../../data/DraftAdjudicationResult'

export enum PageRequestType {
  EVIDENCE_FROM_API,
  EVIDENCE_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.EVIDENCE_FROM_SESSION
  }
}

export default class DetailsOfEvidencePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly evidenceSessionService: EvidenceSessionService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    // draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const evidenceIndexToDelete = Number(req.query.delete) || null
    const evidenceTypeToDelete = (req.query.type as string) || null
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const addEvidenceUrl = adjudicationUrls.detailsOfEvidence.urls.add(adjudicationNumber)

    const [draftAdjudicationResult, prisoner] = await Promise.all([
      this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user),
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
    ])
    const { draftAdjudication } = draftAdjudicationResult
    const reportedAdjudicationNumber = draftAdjudication.adjudicationNumber
    const evidence = this.getEvidence(req, adjudicationNumber, draftAdjudication)
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
        exitButtonHref: taskListUrl,
        addEvidenceButtonHref: addEvidenceUrl,
      })
    }

    return res.render(`pages/detailsOfEvidence`, {
      currentUser: user.username,
      adjudicationNumber,
      reportedAdjudicationNumber,
      evidence,
      prisoner,
      redirectAfterRemoveUrl: `${adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber)}`,
      exitButtonHref: taskListUrl,
      addEvidenceButtonHref: addEvidenceUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isReportedAdjudication = !!req.body.reportedAdjudicationNumber

    // If displaying data on draft, nothing has changed so no save needed
    if (!this.pageOptions.displaySessionData()) {
      this.evidenceSessionService.deleteAllSessionEvidence(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
    }
    const evidenceDetails = this.evidenceSessionService.getAndDeleteAllSessionEvidence(req, adjudicationNumber)

    // we need to merge the different evidence types back together into one array
    const allEvidence = [...evidenceDetails.photoVideo, ...evidenceDetails.baggedAndTagged]
    await this.placeOnReportService.saveEvidenceDetails(adjudicationNumber, allEvidence, user)
    return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
  }

  getEvidence = (req: Request, adjudicationNumber: number, draftAdjudication: DraftAdjudication) => {
    if (this.pageOptions.displaySessionData()) {
      return this.evidenceSessionService.getAllSessionEvidence(req, adjudicationNumber)
    }

    const photoVideo = this.getEvidenceCategory(draftAdjudication.evidence, false)
    const baggedAndTagged = this.getEvidenceCategory(draftAdjudication.evidence, true)

    return {
      photoVideo,
      baggedAndTagged,
    }
  }

  getEvidenceCategory = (evidenceArray: EvidenceDetails[], isBaggedAndTagged: boolean) => {
    if (!evidenceArray) return []
    if (isBaggedAndTagged) {
      return evidenceArray.filter(evidenceItem => evidenceItem.code === EvidenceCode.BAGGED_AND_TAGGED)
    }
    return evidenceArray.filter(evidenceItem => evidenceItem.code !== EvidenceCode.BAGGED_AND_TAGGED)
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    // TODO This will be the new witnesses section but until it is built this can go to the incident statement page
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
