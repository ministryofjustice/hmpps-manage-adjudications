/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import adjudicationUrls from '../../../utils/urlGenerator'
import validateForm, { ReviewStatus } from './prisonerReportReviewValidation'
import { FormError } from '../../../@types/template'
import { getEvidenceCategory, hasAnyRole } from '../../../utils/utils'
import { DraftAdjudication, EvidenceDetails } from '../../../data/DraftAdjudicationResult'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import { User } from '../../../data/hmppsManageUsersClient'
import config from '../../../config'
import UserService from '../../../services/userService'

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
  chargeNumber: string,
  draftId: number
) => {
  if (pageOptions.isReviewerView()) {
    return {
      // We don't need a editIncidentStatementURL here as a reviewer can't edit the statement
      printHref: `${adjudicationUrls.printReport.urls.dis12(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(chargeNumber)}`,
      editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        prisonerNumber,
        draftId
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(chargeNumber)}`,
      returnLinkURL: adjudicationUrls.allCompletedReports.root,
      returnLinkContent: 'Return to all completed reports',
      editOffencesDetailsURL: adjudicationUrls.reviewerEditOffenceWarning.urls.edit(chargeNumber),
      editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(chargeNumber)}`,
      editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(chargeNumber)}`,
      editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(chargeNumber)}`,
      reportHref: adjudicationUrls.prisonerReport.urls.review(chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      formsHref: adjudicationUrls.forms.urls.review(chargeNumber),
    }
  }
  if (pageOptions.isReadOnlyView()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.viewOnly(chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.viewOnly(chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.viewOnly(chargeNumber),
      formsHref: adjudicationUrls.forms.urls.review(chargeNumber),
      editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.viewOnly(chargeNumber)}`,
      editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.viewOnly(chargeNumber)}`,
      editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
        chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.viewOnly(chargeNumber)}`,
    }
  }
  return {
    printHref: `${adjudicationUrls.printReport.urls.dis12(
      chargeNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(chargeNumber)}`,
    editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
      prisonerNumber,
      draftId
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(chargeNumber)}`,
    returnLinkURL: adjudicationUrls.yourCompletedReports.root,
    returnLinkContent: 'Return to your completed reports',
    editOffencesDetailsURL: adjudicationUrls.ageOfPrisoner.urls.submittedEdit(draftId),
    editDamagesURL: `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
      chargeNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(chargeNumber)}`,
    editEvidenceURL: `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
      chargeNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(chargeNumber)}`,
    editWitnessesURL: `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
      chargeNumber
    )}?referrer=${adjudicationUrls.prisonerReport.urls.report(chargeNumber)}`,
    reportHref: adjudicationUrls.prisonerReport.urls.report(chargeNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.report(chargeNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(chargeNumber),
    formsHref: adjudicationUrls.forms.urls.review(chargeNumber),
  }
}

export default class prisonerReportRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
      user
    )

    const { status } = reportedAdjudication
    const draftRequired = this.statusAllowsEditRequiringDraft(status)

    const { newDraftAdjudicationId, draftAdjudication, prisoner, prisonerReportData, offence } =
      await this.prisonerReportDetails(draftRequired, user, chargeNumber, reportedAdjudication)

    const reviewData = await this.reportedAdjudicationsService.getReviewDetails(reportedAdjudication, user)

    const prisonerReportVariables = getVariablesForPageType(
      this.pageOptions,
      prisoner.prisonerNumber,
      draftRequired ? draftAdjudication.chargeNumber : reportedAdjudication.chargeNumber,
      newDraftAdjudicationId
    )

    const convertedEvidence = convertEvidenceToTableFormat(reportedAdjudication.evidence)

    const editAndReviewAvailability = this.getEditAndReviewAvailability(reportedAdjudication, this.pageOptions, status)

    const returned = status === ReportedAdjudicationStatus.RETURNED

    const getTransferBannerInfo = await this.reportedAdjudicationsService.getTransferBannerInfo(
      reportedAdjudication,
      user
    )

    const userRoles = await this.userService.getUserRoles(user.token)
    const showFormsTab = config.formsTabFlag === 'true' && hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)

    const hideChargeNumberAndPrintForAdjudicationStatuses = [
      ReportedAdjudicationStatus.AWAITING_REVIEW,
      ReportedAdjudicationStatus.REJECTED,
      ReportedAdjudicationStatus.RETURNED,
    ].includes(reportedAdjudication.status)

    return res.render(`pages/adjudicationForReport/prisonerReport`, {
      pageData: { ...pageData, returned },
      prisoner,
      prisonerReportData,
      reviewData,
      chargeNumber: reportedAdjudication.chargeNumber,
      draftChargeNumber: draftRequired ? draftAdjudication.id : null,
      offence,
      ...prisonerReportVariables,
      editAndReviewAvailability,
      damages: reportedAdjudication.damages,
      evidence: convertedEvidence,
      witnesses: reportedAdjudication.witnesses,
      transferBannerContent: getTransferBannerInfo.transferBannerContent,
      showTransferHearingWarning: getTransferBannerInfo.originatingAgencyToAddOutcome,
      overrideAgencyId: reportedAdjudication.overrideAgencyId,
      showChargeNumberAndPrint: !hideChargeNumberAndPrintForAdjudicationStatuses,
      showFormsTab,
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
    if (this.pageOptions.isReadOnlyView()) return false
    return [ReportedAdjudicationStatus.AWAITING_REVIEW, ReportedAdjudicationStatus.RETURNED].includes(status)
  }

  prisonerReportDetails = async (
    draftRequired: boolean,
    user: User,
    chargeNumber: string,
    reportedAdjudication: ReportedAdjudication
  ) => {
    if (draftRequired) {
      const newDraftAdjudicationId = await this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(
        user,
        chargeNumber
      )
      const { draftAdjudication, prisoner, associatedPrisoner } =
        await this.decisionTreeService.draftAdjudicationIncidentData(newDraftAdjudicationId, user)

      const prisonerReportData = await this.reportedAdjudicationsService.getPrisonerReport(
        user,
        draftAdjudication as ReportedAdjudication & DraftAdjudication,
        draftRequired
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
    const { chargeNumber } = req.params
    const { user } = res.locals

    const status = this.reviewStatus(req.body.currentStatusSelected)
    const reason = this.reason(status, req)
    const details = this.details(status, req)

    const errors = validateForm({ status, reason, details })
    if (errors) return this.renderView(req, res, { errors, status, reason, details })

    await this.reportedAdjudicationsService.updateAdjudicationStatus(chargeNumber, status, reason, details, user)
    if (status === ReviewStatus.UNSCHEDULED) {
      return res.redirect(adjudicationUrls.acceptedReportConfirmation.urls.start(chargeNumber))
    }
    return res.redirect(adjudicationUrls.allCompletedReports.root)
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})
}
