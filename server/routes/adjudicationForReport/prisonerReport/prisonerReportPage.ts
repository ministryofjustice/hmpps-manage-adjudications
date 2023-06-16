/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'
import validateForm, { ReviewStatus } from './prisonerReportReviewValidation'
import { FormError } from '../../../@types/template'
import { getEvidenceCategory } from '../../../utils/utils'
import { DraftAdjudication, EvidenceDetails } from '../../../data/DraftAdjudicationResult'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import { User } from '../../../data/hmppsAuthClient'

type PageData = {
  errors?: FormError[]
  status?: ReviewStatus
  reason?: string
  details?: string
  returned?: boolean
}

export enum PageRequestType {
  REPORTER,
  REVIEWER,
  VIEW,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReporterView(): boolean {
    return this.pageType === PageRequestType.REPORTER
  }

  isReviewerView(): boolean {
    return this.pageType === PageRequestType.REVIEWER
  }

  isReadOnlyView(): boolean {
    return this.pageType === PageRequestType.VIEW
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
      editOffencesDetailsURL: adjudicationUrls.reviewerEditOffenceWarning.urls.edit(adjudicationNumber),
      editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
        adjudicationNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)}`,
      reportHref: adjudicationUrls.prisonerReport.urls.review(adjudicationNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber),
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
    reportHref: adjudicationUrls.prisonerReport.urls.report(adjudicationNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.report(adjudicationNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(adjudicationNumber),
  }
}

export default class prisonerReportRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )

    const { status } = reportedAdjudication
    const draftRequired = this.statusAllowsEditRequiringDraft(status)

    const { newDraftAdjudicationId, draftAdjudication, prisoner, prisonerReportData, offence } =
      await this.prisonerReportDetails(draftRequired, user, adjudicationNumber, reportedAdjudication)

    const reviewData = await this.reportedAdjudicationsService.getReviewDetails(reportedAdjudication, user)

    const prisonerReportVariables = getVariablesForPageType(
      this.pageOptions,
      prisoner.prisonerNumber,
      draftRequired ? draftAdjudication.adjudicationNumber : reportedAdjudication.adjudicationNumber,
      newDraftAdjudicationId
    )

    const convertedEvidence = convertEvidenceToTableFormat(reportedAdjudication.evidence)

    const editAndReviewAvailability = this.getEditAndReviewAvailability(reportedAdjudication, this.pageOptions, status)

    const returned = status === ReportedAdjudicationStatus.RETURNED

    return res.render(`pages/adjudicationForReport/prisonerReport`, {
      pageData: { ...pageData, returned },
      prisoner,
      prisonerReportData,
      reviewData,
      reportNo: reportedAdjudication.adjudicationNumber,
      draftAdjudicationNumber: draftRequired ? draftAdjudication.id : null,
      offence,
      ...prisonerReportVariables,
      editAndReviewAvailability,
      damages: reportedAdjudication.damages,
      evidence: convertedEvidence,
      witnesses: reportedAdjudication.witnesses,
    })
  }

  getEditAndReviewAvailability = (
    reportedAdjudication: ReportedAdjudication,
    pageOptions: PageOptions,
    status: ReportedAdjudicationStatus
  ) => {
    const awaitingReviewOrReturned = [
      ReportedAdjudicationStatus.AWAITING_REVIEW,
      ReportedAdjudicationStatus.RETURNED,
    ].includes(reportedAdjudication.status)
    const { transferableActionsAllowed } = reportedAdjudication
    const transferableActionsAllowedAfterReview =
      transferableActionsAllowed &&
      ![
        ReportedAdjudicationStatus.AWAITING_REVIEW,
        ReportedAdjudicationStatus.RETURNED,
        ReportedAdjudicationStatus.REJECTED,
      ].includes(reportedAdjudication.status)

    return {
      incidentDetailsEditable: pageOptions.isReporterView() && awaitingReviewOrReturned,
      offencesEditable: !pageOptions.isReadOnlyView() && awaitingReviewOrReturned,
      statementEditable: pageOptions.isReporterView() && awaitingReviewOrReturned,
      damagesEvidenceWitnessesEditable: pageOptions.isReadOnlyView()
        ? transferableActionsAllowedAfterReview
        : status !== 'REJECTED',
      reviewAvailable: pageOptions.isReviewerView() && awaitingReviewOrReturned,
    }
  }

  reviewStatus = (selected: string): ReviewStatus => {
    switch (selected) {
      case 'rejected':
        return ReviewStatus.REJECTED
      case 'returned':
        return ReviewStatus.RETURNED
      case 'accepted':
        return ReviewStatus.UNSCHEDULED
      default:
        return null
    }
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
    if (status === ReviewStatus.ACCEPTED) {
      return req.body.acceptedDetails
    }
    return ''
  }

  statusAllowsEditRequiringDraft = (status: ReportedAdjudicationStatus): boolean => {
    return [ReportedAdjudicationStatus.AWAITING_REVIEW, ReportedAdjudicationStatus.RETURNED].includes(status)
  }

  prisonerReportDetails = async (
    draftRequired: boolean,
    user: User,
    adjudicationNumber: number,
    reportedAdjudication: ReportedAdjudication
  ) => {
    if (draftRequired) {
      const newDraftAdjudicationId = await this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(
        user,
        adjudicationNumber
      )
      const { draftAdjudication, prisoner, associatedPrisoner } =
        await this.decisionTreeService.draftAdjudicationIncidentData(newDraftAdjudicationId, user)

      const prisonerReportData = await this.reportedAdjudicationsService.getPrisonerReport(
        user,
        draftAdjudication as ReportedAdjudication & DraftAdjudication
      )
      const offence = await this.decisionTreeService.getAdjudicationOffences(
        draftAdjudication.offenceDetails,
        prisoner,
        associatedPrisoner,
        draftAdjudication.incidentRole,
        user,
        false
      )
      return {
        newDraftAdjudicationId,
        draftAdjudication,
        prisoner,
        associatedPrisoner,
        prisonerReportData,
        offence,
      }
    }
    const { prisoner, associatedPrisoner } = await this.decisionTreeService.adjudicationIncidentData(
      reportedAdjudication,
      user
    )
    const prisonerReportData = await this.reportedAdjudicationsService.getPrisonerReport(
      user,
      reportedAdjudication as ReportedAdjudication & DraftAdjudication
    )
    const offence = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      false
    )
    return {
      newDraftAdjudicationId: null as number,
      draftAdjudication: null as DraftAdjudication,
      prisoner,
      associatedPrisoner,
      prisonerReportData,
      offence,
    }
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
    if (status === ReviewStatus.UNSCHEDULED) {
      return res.redirect(adjudicationUrls.acceptedReportConfirmation.urls.start(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.allCompletedReports.root)
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})
}
