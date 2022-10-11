/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import LocationService from '../../../services/locationService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'
import validateForm, { ReviewStatus } from './adjudicationReportReviewValidation'
import { FormError } from '../../../@types/template'
import { getEvidenceCategory } from '../../../utils/utils'
import { EvidenceDetails } from '../../../data/DraftAdjudicationResult'

type PageData = {
  errors?: FormError[]
  status?: ReviewStatus
  reason?: string
  details?: string
}

export enum PageRequestType {
  REPORTER,
  REVIEWER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReviewerView(): boolean {
    return this.pageType === PageRequestType.REVIEWER
  }
}

const convertEvidenceToTableFormat = (evidence: EvidenceDetails[]) => {
  const photoVideo = getEvidenceCategory(evidence, false)
  const baggedAndTagged = getEvidenceCategory(evidence, true)
  return {
    photoVideo,
    baggedAndTagged,
  }
}

const getVariablesForPageType = (
  pageOptions: PageOptions,
  prisonerNumber: string,
  adjudicationNumber: number,
  draftAdjudicationNumber: number
) => {
  if (pageOptions.isReviewerView()) {
    return {
      // We don't need a editIncidentStatementURL here as a reviewer can't edit the statement
      printHref: `${adjudicationUrls.printReport.urls.start(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        prisonerNumber,
        draftAdjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      returnLinkURL: adjudicationUrls.allCompletedReports.root,
      returnLinkContent: 'Return to all completed reports',
      editOffencesDetailsURL: adjudicationUrls.ageOfPrisoner.urls.submittedEdit(adjudicationNumber),
      editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      reportHref: adjudicationUrls.adjudicationReport.urls.review(adjudicationNumber), // TODO probably needs referrer?
    }
  }
  return {
    printHref: `${adjudicationUrls.printReport.urls.start(
      adjudicationNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(adjudicationNumber)}`,
    editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
      prisonerNumber,
      draftAdjudicationNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(adjudicationNumber)}`,
    returnLinkURL: adjudicationUrls.yourCompletedReports.root,
    returnLinkContent: 'Return to your completed reports',
    editOffencesDetailsURL: adjudicationUrls.ageOfPrisoner.urls.submittedEdit(draftAdjudicationNumber),
    editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
      adjudicationNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(adjudicationNumber)}`,
    editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
      adjudicationNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(adjudicationNumber)}`,
    editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
      adjudicationNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(adjudicationNumber)}`,
    reportHref: adjudicationUrls.adjudicationReport.urls.report(adjudicationNumber), // TODO probably needs referrer?
  }
}

export default class adjudicationReportRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { user } = res.locals

    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const [newDraftAdjudicationId, reportedAdjudication] = await Promise.all([
      this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(user, adjudicationNumber),
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(adjudicationNumber, user),
    ])

    const { draftAdjudication, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(newDraftAdjudicationId, user)

    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )

    const [prisonerReportData, reviewData] = await Promise.all([
      this.reportedAdjudicationsService.getPrisonerReport(user, incidentLocations, draftAdjudication),
      this.reportedAdjudicationsService.getReviewDetails(reportedAdjudication, user),
    ])

    const offences = await this.decisionTreeService.getAdjudicationOffences(
      draftAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      draftAdjudication.incidentRole,
      user,
      false
    )

    const prisonerReportVariables = getVariablesForPageType(
      this.pageOptions,
      prisoner.prisonerNumber,
      draftAdjudication.adjudicationNumber,
      newDraftAdjudicationId
    )

    const convertedEvidence = convertEvidenceToTableFormat(reportedAdjudication.reportedAdjudication.evidence)

    const readOnly =
      this.pageOptions.isReviewerView() ||
      ['ACCEPTED', 'REJECTED'].includes(reportedAdjudication.reportedAdjudication.status)

    const readOnlyDamagesEvidenceWitnesses = reportedAdjudication.reportedAdjudication.status === 'REJECTED'

    const review =
      this.pageOptions.isReviewerView() &&
      ['AWAITING_REVIEW'].includes(reportedAdjudication.reportedAdjudication.status)

    return res.render(`pages/adjudicationTabbedParent/adjudicationReport`, {
      pageData,
      prisoner,
      prisonerReportData,
      reviewData,
      reportNo: draftAdjudication.adjudicationNumber,
      draftAdjudicationNumber: draftAdjudication.id,
      offences,
      ...prisonerReportVariables,
      readOnly,
      review,
      readOnlyDamagesEvidenceWitnesses,
      damages: reportedAdjudication.reportedAdjudication.damages,
      evidence: convertedEvidence,
      witnesses: reportedAdjudication.reportedAdjudication.witnesses,
      hearingsHref: adjudicationUrls.hearingDetails.urls.start(
        reportedAdjudication.reportedAdjudication.adjudicationNumber
      ),
    })
  }

  reviewStatus = (selected: string): ReviewStatus => {
    if (!selected) {
      return null
    }
    if (selected === 'rejected') {
      return ReviewStatus.REJECTED
    }
    if (selected === 'returned') {
      return ReviewStatus.RETURNED
    }
    return ReviewStatus.ACCEPTED
  }

  reason = (status: ReviewStatus, req: Request): string => {
    if (status === ReviewStatus.REJECTED) {
      return req.body.rejectedReasonId
    }
    if (status === ReviewStatus.RETURNED) {
      return req.body.returnedReasonId
    }
    return ''
  }

  details = (status: ReviewStatus, req: Request): string => {
    if (status === ReviewStatus.REJECTED) {
      return req.body.rejectedDetails
    }
    if (status === ReviewStatus.RETURNED) {
      return req.body.returnedDetails
    }
    return ''
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals

    const status = this.reviewStatus(req.body.currentStatusSelected)
    const reason = this.reason(status, req)
    const details = this.details(status, req)

    const errors = validateForm({ status, reason, details })
    if (errors) return this.renderView(req, res, { errors, status, reason, details })

    await this.reportedAdjudicationsService.updateAdjudicationStatus(adjudicationNumber, status, reason, details, user)
    return res.redirect(adjudicationUrls.allCompletedReports.root)
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})
}
