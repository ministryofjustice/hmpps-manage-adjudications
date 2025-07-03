import { Request, Response } from 'express'
import ReportedAdjudicationsService, { ConvertedEvidence } from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import DecisionTreeService, { IncidentAndOffences } from '../../services/decisionTreeService'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import { User } from '../../data/hmppsManageUsersClient'
import { getSchedulingUnavailableStatuses } from '../adjudicationForReport/hearingTab/hearingTabHelper'
import PunishmentsService from '../../services/punishmentsService'
import {
  PunishmentComment,
  PunishmentData,
  PunishmentDataWithSchedule,
  flattenPunishments,
} from '../../data/PunishmentResult'
import { hasAnyRole } from '../../utils/utils'

type PageData = {
  prisoner: PrisonerResultSummary
  reviewData: { reviewSummary?: { label: string; value: string }[]; reviewStatus: string }
  evidence: ConvertedEvidence
  reportedAdjudication: ReportedAdjudication
  prisonerReportData: {
    offence: IncidentAndOffences
    prisonerReportDetails: {
      incidentDetails: { label: string; value: string }[]
      statement: string
      isYouthOffender: boolean
    }
  }
  transferBannerContent: string
  showTransferHearingWarning: boolean
  latestHearingId: number
  history: unknown
  punishments: PunishmentData[]
  filteredPunishments: {
    damages: Array<PunishmentData | PunishmentDataWithSchedule>
    otherPunishments: Array<PunishmentData | PunishmentDataWithSchedule>
  }
  punishmentComments: PunishmentComment[]
  quashed: boolean
  chargeProved: boolean
  corrupted: boolean
  forbidden?: boolean
}

export default class AdjudicationConsolidatedView {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly punishmentsService: PunishmentsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const {
      prisoner,
      reviewData,
      evidence,
      prisonerReportData,
      reportedAdjudication,
      transferBannerContent,
      showTransferHearingWarning,
      latestHearingId,
      history,
      punishments,
      filteredPunishments,
      punishmentComments,
      quashed,
      chargeProved,
      corrupted,
      forbidden,
    } = pageData
    res.render(`pages/adjudicationConsolidatedView.njk`, {
      prisonerNumber: prisoner.prisonerNumber,
      prisoner,
      reviewData,
      evidence,
      prisonerReportData,
      reportedAdjudication,
      transferBannerContent,
      showTransferHearingWarning,
      latestHearingId,
      history,
      readOnly: true,
      schedulingNotAvailable: getSchedulingUnavailableStatuses(reportedAdjudication),
      punishments,
      filteredPunishments,
      punishmentComments,
      quashed,
      chargeProved,
      corrupted,
      forbidden,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, prisonerNumber } = req.params
    const { user } = res.locals
    const activeCaseLoadId = req.query.agency as string
    let forbidden = false

    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(prisonerNumber, user)
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
      user,
      activeCaseLoadId
    )

    if (prisoner.agencyId !== user.meta.caseLoadId) {
      const userRoles = await this.userService.getUserRoles(user.token)
      forbidden = !hasAnyRole(['GLOBAL_SEARCH'], userRoles)
    }
    if (prisoner.prisonerNumber !== reportedAdjudication.prisonerNumber) {
      forbidden = true
    }

    const { reviewData, evidence, offence, prisonerReportDetails, transferBannerInfo } = await this.getInfoForReport(
      reportedAdjudication,
      prisoner,
      user
    )
    const { history, latestHearingId } = await this.getInfoForHearings(reportedAdjudication, user)

    const { punishments, filteredPunishments, punishmentComments, quashed, chargeProved, corrupted } =
      await this.getInfoForPunishments(reportedAdjudication, user)

    return this.renderView(req, res, {
      prisoner,
      reportedAdjudication,
      reviewData,
      evidence,
      prisonerReportData: { offence, prisonerReportDetails },
      transferBannerContent: transferBannerInfo.transferBannerContent,
      showTransferHearingWarning: transferBannerInfo.originatingAgencyToAddOutcome,
      history,
      latestHearingId,
      punishments,
      filteredPunishments,
      punishmentComments,
      quashed,
      chargeProved,
      corrupted,
      forbidden,
    })
  }

  private getInfoForReport = async (
    reportedAdjudication: ReportedAdjudication,
    prisoner: PrisonerResultSummary,
    user: User
  ) => {
    const reviewData = await this.reportedAdjudicationsService.getReviewDetails(reportedAdjudication, user)
    const evidence = await this.reportedAdjudicationsService.convertEvidenceToTableFormat(reportedAdjudication.evidence)
    const { associatedPrisoner } = await this.decisionTreeService.adjudicationIncidentData(reportedAdjudication, user)
    const offence = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      false
    )
    const prisonerReportDetails = await this.reportedAdjudicationsService.getPrisonerReport(
      user,
      reportedAdjudication as ReportedAdjudication & DraftAdjudication
    )

    const transferBannerInfo = await this.reportedAdjudicationsService.getTransferBannerInfo(reportedAdjudication, user)
    return {
      reviewData,
      evidence,
      offence,
      prisonerReportDetails,
      transferBannerInfo,
    }
  }

  private getInfoForHearings = async (reportedAdjudication: ReportedAdjudication, user: User) => {
    const history = await this.reportedAdjudicationsService.getOutcomesHistory(reportedAdjudication.outcomes, user)
    const latestHearingId = reportedAdjudication.hearings?.length
      ? reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].id
      : null
    return {
      history,
      latestHearingId,
    }
  }

  private getInfoForPunishments = async (reportedAdjudication: ReportedAdjudication, user: User) => {
    const punishments = flattenPunishments(reportedAdjudication.punishments)
    const filteredPunishments = await this.punishmentsService.filteredPunishments(punishments)
    const punishmentComments = await this.punishmentsService.formatPunishmentComments(
      reportedAdjudication,
      reportedAdjudication.chargeNumber,
      user
    )
    return {
      punishments,
      filteredPunishments,
      punishmentComments,
      quashed: reportedAdjudication.status === ReportedAdjudicationStatus.QUASHED,
      chargeProved: reportedAdjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED,
      corrupted:
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_OUTCOME ||
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_SUSPENDED ||
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_ADA,
    }
  }
}
