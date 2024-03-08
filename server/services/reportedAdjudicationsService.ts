import { ConfirmedOnReportChangedData, ConfirmedOnReportData, DIS7Data } from '../data/ConfirmedOnReportData'
import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient, { OffenderBannerInfo } from '../data/prisonApiClient'
import ManageAdjudicationsSystemTokensClient, {
  AgencyReportCounts,
  Dis5AdjudicationsAndMoneyPrintSupport,
} from '../data/manageAdjudicationsSystemTokensClient'
import CuriousApiService from './curiousApiService'
import {
  AdjudicationHistoryFilter,
  AwardedPunishmentsAndDamages,
  FormattedDisIssue,
  IssueStatus,
  ReportedAdjudication,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationEnhanced,
  ReportedAdjudicationEnhancedWithIssuingDetails,
  ReportedAdjudicationFilter,
  ReportedAdjudicationResult,
  ReportedAdjudicationsResult,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
  ScheduledHearing,
} from '../data/ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import {
  convertToTitleCase,
  formatReportingOfficer,
  formatLocation,
  formatName,
  formatTimestampTo,
  formatTimestampToDate,
  getDate,
  getFormattedOfficerName,
  getTime,
  hasAnyRole,
  getEvidenceCategory,
} from '../utils/utils'
import { Location, LocationId } from '../data/PrisonLocationResult'
import {
  DamageDetails,
  DraftAdjudication,
  EvidenceDetails,
  PrisonerReport,
  WitnessDetails,
} from '../data/DraftAdjudicationResult'
import LocationService from './locationService'
import { ReviewStatus } from '../routes/adjudicationForReport/prisonerReport/prisonerReportReviewValidation'
import { PrisonerResultSummary } from './placeOnReportService'
import PrisonerSimpleResult from '../data/prisonerSimpleResult'
import { Alert, alertFlagLabels, AlertFlags } from '../utils/alertHelper'
import {
  HearingDetails,
  HearingDetailsHistory,
  HearingOutcomeCode,
  OutcomeCode,
  OutcomeDetailsHistory,
  OutcomeHistory,
  ReferralOutcomeCode,
} from '../data/HearingAndOutcomeResult'
import adjudicationUrls from '../utils/urlGenerator'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'
import { AwardedPunishmentsAndDamagesFilter, TransferredAdjudicationFilter } from '../utils/adjudicationFilterHelper'
import { PunishmentType } from '../data/PunishmentResult'
import { EstablishmentInformation } from '../@types/template'
import { AdjudicationHistoryBookingType } from '../data/AdjudicationHistoryData'
import UserService from './userService'

function getNonEnglishLanguage(primaryLanguage: string): string {
  if (!primaryLanguage || primaryLanguage === 'English') {
    return null
  }
  return primaryLanguage
}

export type ConvertedEvidence = {
  photoVideo: EvidenceDetails[]
  baggedAndTagged: EvidenceDetails[]
  other: EvidenceDetails[]
}

export default class ReportedAdjudicationsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient,
    private readonly curiousApiService: CuriousApiService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {}

  async getReportedAdjudicationDetails(
    chargeNumber: string,
    user: User,
    activeCaseLoadId: string = user.meta.caseLoadId
  ): Promise<ReportedAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user, activeCaseLoadId).getReportedAdjudication(
      chargeNumber
    )
  }

  async getReviewDetails(reportedAdjudication: ReportedAdjudication, user: User) {
    if (reportedAdjudication.status === ReportedAdjudicationStatus.AWAITING_REVIEW)
      return { reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status) }

    const reviewingOfficer =
      reportedAdjudication.reviewedByUserId &&
      (await this.hmppsManageUsersClient.getUserFromUsername(reportedAdjudication.reviewedByUserId, user.token))

    const getReasonTitle = (status: ReportedAdjudicationStatus) => {
      switch (status) {
        case ReportedAdjudicationStatus.RETURNED:
          return 'Reason for return'
        case ReportedAdjudicationStatus.REJECTED:
          return 'Reason for rejection'
        default:
          return null
      }
    }

    const getReasonValue = (reason: string) => {
      switch (reason) {
        // rejected
        case 'unsuitable':
          return 'Not suitable for an adjudication'
        case 'alternative':
          return 'Should be dealt with in another way'
        case 'expired':
          return 'More than 48 hours have elapsed since the incident'
        // returned
        case 'details':
          return 'Incorrect incident details'
        case 'statement':
          return 'Incorrect or insufficient information in statement'
        case 'offence':
          return 'Incorrect offence chosen'
        default:
          return null
      }
    }

    const reviewSummary = [
      {
        label: 'Last reviewed by',
        value: getFormattedOfficerName(reviewingOfficer?.name),
      },
    ]
    if (reportedAdjudication.status === 'RETURNED' || reportedAdjudication.status === 'REJECTED')
      reviewSummary.push(
        {
          label: getReasonTitle(reportedAdjudication.status),
          value: getReasonValue(reportedAdjudication.statusReason),
        },
        {
          label: 'Details',
          value: reportedAdjudication.statusDetails,
        }
      )
    return {
      reviewSummary,
      reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
    }
  }

  async getDetailsForDIS7(chargeNumber: string, user: User): Promise<DIS7Data> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const { reportedAdjudication } = await new ManageAdjudicationsSystemTokensClient(
      token,
      user
    ).getReportedAdjudication(chargeNumber)

    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(reportedAdjudication.prisonerNumber)
    const location = await this.locationService.getIncidentLocation(
      reportedAdjudication.incidentDetails.locationId,
      user
    )
    const agencyDescription = await this.locationService.getAgency(location.agencyId, user)

    const lastHearing = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1]

    const cautionGiven = reportedAdjudication.punishments.filter(
      punishment => punishment.type === PunishmentType.CAUTION
    )

    const ccPunishmentAwarded = reportedAdjudication.punishments.filter(
      punishment => punishment.type === PunishmentType.CONFINEMENT
    )

    const adaGiven = reportedAdjudication.punishments.filter(
      punishment =>
        punishment.type === PunishmentType.ADDITIONAL_DAYS || punishment.type === PunishmentType.PROSPECTIVE_DAYS
    )

    const damages = reportedAdjudication.punishments.filter(
      punishment => punishment.type === PunishmentType.DAMAGES_OWED
    )
    const activePunishments = reportedAdjudication.punishments.filter(
      punishment => !punishment.schedule?.suspendedUntil
    )

    const activePunishmentsExcludingCautionAndDamages = activePunishments.filter(
      punishment => punishment.type !== PunishmentType.DAMAGES_OWED && punishment.type !== PunishmentType.CAUTION
    )

    const suspendedPunishments = reportedAdjudication.punishments.filter(
      punishment => punishment.schedule?.suspendedUntil
    )

    const adjudicatorName = await this.getAdjudicatorName(lastHearing, user)

    return {
      reportExpirationDateTime: reportedAdjudication.incidentDetails.handoverDeadline,
      prisonerNumber: reportedAdjudication.prisonerNumber,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      statement: reportedAdjudication.incidentStatement.statement,
      incidentLocationName: location.userDescription,
      incidentAgencyName: agencyDescription.description,
      prisonerLivingUnitName: prisoner.assignedLivingUnit.description,
      prisonerAgencyName: prisoner.assignedLivingUnit.agencyName,
      incidentDate: reportedAdjudication.incidentDetails.dateTimeOfIncident,
      createdDateTime: reportedAdjudication.createdDateTime,
      isYouthOffender: reportedAdjudication.isYouthOffender,
      prisonName: prisoner.agencyId,
      adjudicatorType: lastHearing.oicHearingType.includes('INAD') ? 'INAD' : 'GOV',
      cautionGiven: cautionGiven.length > 0,
      ccPunishmentAwarded: ccPunishmentAwarded.length > 0,
      adaGiven: adaGiven.length > 0,
      lastHearingDate: lastHearing.dateTimeOfHearing,
      adjudicatorName,
      damagesAmount: damages.length ? damages[0].damagesOwedAmount : null,
      punishments: activePunishmentsExcludingCautionAndDamages,
      suspendedPunishments,
      suspendedPunishmentsPresent: suspendedPunishments.length > 0,
    }
  }

  async getAdjudicatorName(lastHearing: HearingDetails, user: User) {
    if (lastHearing.oicHearingType.includes('INAD')) return lastHearing.outcome.adjudicator
    try {
      const adjudicatorUser = await this.hmppsManageUsersClient.getUserFromUsername(
        lastHearing.outcome.adjudicator,
        user.token
      )
      return adjudicatorUser.name
    } catch {
      return null
    }
  }

  async getConfirmationDetails(chargeNumber: string, user: User): Promise<ConfirmedOnReportData> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const adjudicationData = await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(
      chargeNumber
    )

    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(
      adjudicationData.reportedAdjudication.prisonerNumber
    )
    const [secondaryLanguages, prisonerNeurodiversities] = await Promise.all([
      new PrisonApiClient(token).getSecondaryLanguages(prisoner.bookingId),
      this.curiousApiService.getNeurodiversitiesForReport(adjudicationData.reportedAdjudication.prisonerNumber, token),
    ])

    const prisonerPreferredNonEnglishLanguage = getNonEnglishLanguage(prisoner.language)
    const prisonerOtherLanguages = secondaryLanguages?.map(l => l.description)

    const location = await this.locationService.getIncidentLocation(
      adjudicationData.reportedAdjudication.incidentDetails.locationId,
      user
    )
    const agencyDescription = await this.locationService.getAgency(location.agencyId, user)

    const reporter = await this.hmppsManageUsersClient.getUserFromUsername(
      adjudicationData.reportedAdjudication.createdByUserId,
      user.token
    )

    return {
      reportExpirationDateTime: adjudicationData.reportedAdjudication.incidentDetails.handoverDeadline,
      prisonerNumber: adjudicationData.reportedAdjudication.prisonerNumber,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      prisonerPreferredNonEnglishLanguage,
      prisonerOtherLanguages,
      prisonerNeurodiversities,
      statement: adjudicationData.reportedAdjudication.incidentStatement.statement,
      incidentLocationName: location.userDescription,
      incidentAgencyName: agencyDescription.description,
      reportingOfficer: getFormattedOfficerName(reporter.name),
      prisonerLivingUnitName: prisoner.assignedLivingUnit.description,
      prisonerAgencyName: prisoner.assignedLivingUnit.agencyName,
      incidentDate: adjudicationData.reportedAdjudication.incidentDetails.dateTimeOfIncident,
      createdDateTime: adjudicationData.reportedAdjudication.createdDateTime,
      isYouthOffender: adjudicationData.reportedAdjudication.isYouthOffender,
      prisonName: prisoner.agencyId,
      nonParoleDate: prisoner.sentenceDetail.nonParoleDate,
      bookingId: prisoner.bookingId,
    }
  }

  async getSimpleConfirmationDetails(chargeNumber: string, user: User): Promise<ConfirmedOnReportChangedData> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const adjudicationData = await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(
      chargeNumber
    )

    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(
      adjudicationData.reportedAdjudication.prisonerNumber
    )
    const reporter = await this.hmppsManageUsersClient.getUserFromUsername(
      adjudicationData.reportedAdjudication.createdByUserId,
      user.token
    )

    return {
      reportExpirationDateTime: adjudicationData.reportedAdjudication.incidentDetails.handoverDeadline,
      prisonerNumber: adjudicationData.reportedAdjudication.prisonerNumber,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      reporter: reporter.name,
    }
  }

  async getYourCompletedAdjudications(
    user: User,
    filter: ReportedAdjudicationFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudicationEnhanced>> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const pageResponse = await new ManageAdjudicationsSystemTokensClient(token, user).getYourCompletedAdjudications(
      filter,
      pageRequest
    )

    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(pageResponse.content.map(_ => _.prisonerNumber))
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    return this.mapData(pageResponse, reportedAdjudication => {
      const enhancedAdjudication = this.enhanceReportedAdjudication(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        null
      )
      return {
        ...enhancedAdjudication,
        isReporterVersion: true,
      }
    })
  }

  async getAllCompletedAdjudications(
    user: User,
    filter: ReportedAdjudicationFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudicationEnhanced>> {
    const pageResponse = await new ManageAdjudicationsUserTokensClient(user).getAllCompletedAdjudications(
      filter,
      pageRequest
    )
    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(pageResponse.content.map(_ => _.prisonerNumber))
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    const usernamesInPage = new Set(pageResponse.content.map(adj => adj.createdByUserId))
    const reporterNamesAndUsernames =
      (await Promise.all(
        [...usernamesInPage].map(username => this.hmppsManageUsersClient.getUserFromUsername(username, user.token))
      )) || []
    const reporterNameByUsernameMap = new Map(reporterNamesAndUsernames.map(u => [u.username, u.name]))

    const uniqueAgencyIds = new Set(pageResponse.content.map(adj => adj.originatingAgencyId))
    const agencyIdsAndNames =
      (await Promise.all([...uniqueAgencyIds].map(agencyId => this.locationService.getAgency(agencyId, user)))) || []
    const agencyNameByIdMap = new Map(agencyIdsAndNames.map(a => [a.agencyId, a.description]))

    return this.mapData(pageResponse, reportedAdjudication => {
      const enhancedAdjudication = this.enhanceReportedAdjudication(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        reporterNameByUsernameMap.get(reportedAdjudication.createdByUserId),
        agencyNameByIdMap.get(reportedAdjudication.originatingAgencyId),
        null
      )
      return {
        ...enhancedAdjudication,
      }
    })
  }

  async getTransferredAdjudicationReports(
    user: User,
    filter: TransferredAdjudicationFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudicationEnhanced>> {
    const pageResponse = await new ManageAdjudicationsUserTokensClient(user).getTransferredAdjudications(
      filter,
      pageRequest
    )

    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(pageResponse.content.map(_ => _.prisonerNumber))
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    const uniqueAgencyIds = [
      ...new Set(
        pageResponse.content.reduce<string[]>((acc, obj) => [...acc, obj.originatingAgencyId, obj.overrideAgencyId], [])
      ),
    ]
    const agencyIdsAndNames =
      (await Promise.all([...uniqueAgencyIds].map(agencyId => this.locationService.getAgency(agencyId, user)))) || []
    const agencyNameByIdMap = new Map(agencyIdsAndNames.map(a => [a.agencyId, a.description]))

    const usernamesInPage = new Set(pageResponse.content.map(adj => adj.createdByUserId))
    const reporterNamesAndUsernames =
      (await Promise.all(
        [...usernamesInPage].map(username => this.hmppsManageUsersClient.getUserFromUsername(username, user.token))
      )) || []
    const reporterNameByUsernameMap = new Map(reporterNamesAndUsernames.map(u => [u.username, u.name]))

    return this.mapData(pageResponse, reportedAdjudication => {
      const enhancedAdjudication = this.enhanceReportedAdjudication(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        reporterNameByUsernameMap.get(reportedAdjudication.createdByUserId),
        agencyNameByIdMap.get(reportedAdjudication.originatingAgencyId),
        agencyNameByIdMap.get(reportedAdjudication.overrideAgencyId)
      )
      return {
        ...enhancedAdjudication,
      }
    })
  }

  async getIssueDataForAdjudications(
    user: User,
    filter: ReportedAdjudicationDISFormFilter,
    filterUsingHearingDate: boolean
  ): Promise<ReportedAdjudicationsResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    if (filterUsingHearingDate) {
      return new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudicationPrintData(filter)
    }
    return new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudicationIssueData(filter)
  }

  async getAdjudicationDISFormData(
    user: User,
    filter: ReportedAdjudicationDISFormFilter,
    filterUsingHearingDate = false
  ): Promise<ReportedAdjudicationEnhancedWithIssuingDetails[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const response = await this.getIssueDataForAdjudications(user, filter, filterUsingHearingDate)
    const { reportedAdjudications } = response
    const prisonerNumbers = reportedAdjudications.map(_ => _.prisonerNumber)

    const prisonerDetails = new Map(
      (await new PrisonApiClient(token).getBatchPrisonerDetails(prisonerNumbers)).map(prisonerDetail => [
        prisonerDetail.offenderNo,
        prisonerDetail,
      ])
    )

    const alertMap = filterUsingHearingDate ? await this.getAlerts(prisonerNumbers, user) : null

    const usernamesInPage = new Set(
      reportedAdjudications.filter(adj => adj.issuingOfficer).map(adj => adj.issuingOfficer)
    )
    const issuingOfficerNamesAndUsernames =
      (await Promise.all(
        [...usernamesInPage].map(username => this.hmppsManageUsersClient.getUserFromUsername(username, user.token))
      )) || []
    const issuingOfficerNameByUsernameMap = new Map(issuingOfficerNamesAndUsernames.map(u => [u.username, u.name]))

    return reportedAdjudications.map(reportedAdjudication => {
      return this.enhanceAdjudicationWithIssuingDetails(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        issuingOfficerNameByUsernameMap,
        filterUsingHearingDate ? alertMap.get(reportedAdjudication.prisonerNumber) : null
      )
    })
  }

  async getAlerts(prisonerNumbers: string[], user: User): Promise<Map<string, Alert[]>> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const alertsForEachPrisoner = await Promise.all(
      prisonerNumbers.map(prn => new PrisonApiClient(token).getAlertsForPrisoner(prn))
    )
    const alertMap = new Map(alertsForEachPrisoner.map(a => [a.prisonerNumber, a.alerts]))
    return alertMap
  }

  async updateAdjudicationStatus(
    chargeNumber: string,
    status: ReviewStatus,
    reason: string,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).updateAdjudicationStatus(chargeNumber, {
      status,
      statusReason: reason,
      statusDetails: details,
    })
  }

  async updateDamageDetails(
    chargeNumber: string,
    damages: DamageDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).updateDamageDetails(chargeNumber, damages)
  }

  async updateEvidenceDetails(
    chargeNumber: string,
    evidence: EvidenceDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).updateEvidenceDetails(chargeNumber, evidence)
  }

  async convertEvidenceToTableFormat(evidence: EvidenceDetails[]): Promise<ConvertedEvidence> {
    const photoVideo = getEvidenceCategory(evidence, false, false)
    const baggedAndTagged = getEvidenceCategory(evidence, true, false)
    const other = getEvidenceCategory(evidence, false, true)
    return {
      photoVideo,
      baggedAndTagged,
      other,
    }
  }

  async updateWitnessDetails(
    chargeNumber: string,
    witnesses: WitnessDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).updateWitnessDetails(chargeNumber, witnesses)
  }

  private getPrisonerDisplayNames(prisonerResult: PrisonerSimpleResult) {
    if (!prisonerResult)
      return {
        displayName: 'Unknown',
        friendlyName: 'Unknown',
      }
    const displayName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.lastName}, ${prisonerResult.firstName}`)) || ''
    const friendlyName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || ''
    return {
      displayName,
      friendlyName,
    }
  }

  async getTransferAgencyDetails(reportedAdjudication: ReportedAdjudication, user: User) {
    const [originatingAgencyName, overrideAgencyName] = await Promise.all([
      (await this.locationService.getAgency(reportedAdjudication.originatingAgencyId, user))?.description,
      (await this.locationService.getAgency(reportedAdjudication.overrideAgencyId, user))?.description,
    ])
    return {
      originatingAgencyName,
      overrideAgencyName,
    }
  }

  enhanceReportedAdjudication(
    reportedAdjudication: ReportedAdjudication,
    prisonerResult: PrisonerSimpleResult,
    reporterName: string,
    originatingAgencyName?: string,
    overrideAgencyName?: string
  ): ReportedAdjudicationEnhanced {
    const prisonerNames = this.getPrisonerDisplayNames(prisonerResult)
    const { displayName, friendlyName } = prisonerNames
    const reportingOfficer = (reporterName && convertToTitleCase(reporterName)) || ''

    const latestSheduledHearingDate =
      reportedAdjudication.status === ReportedAdjudicationStatus.SCHEDULED
        ? reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing
        : null

    return {
      ...reportedAdjudication,
      displayName,
      friendlyName,
      reportingOfficer,
      originatingAgencyName: originatingAgencyName || null,
      overrideAgencyName: overrideAgencyName || null,
      dateTimeOfIncident: reportedAdjudication.incidentDetails.dateTimeOfIncident,
      formattedDateTimeOfIncident: formatTimestampToDate(
        reportedAdjudication.incidentDetails.dateTimeOfIncident,
        'D MMMM YYYY - HH:mm'
      ),
      dateTimeOfDiscovery: reportedAdjudication.incidentDetails.dateTimeOfDiscovery,
      formattedDateTimeOfDiscovery: formatTimestampToDate(
        reportedAdjudication.incidentDetails.dateTimeOfDiscovery,
        'D MMMM YYYY - HH:mm'
      ),
      statusDisplayName: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
      formattedDateTimeOfScheduledHearing:
        formatTimestampToDate(latestSheduledHearingDate, 'D MMMM YYYY - HH:mm') || ' - ',
    }
  }

  enhanceAdjudicationWithIssuingDetails(
    reportedAdjudication: ReportedAdjudication,
    prisonerResult: PrisonerSimpleResult,
    issuingOfficerNameByUsernameMap: Map<string, string>,
    prisonersAlerts: Alert[] = []
  ): ReportedAdjudicationEnhancedWithIssuingDetails {
    const issuingOfficerName = issuingOfficerNameByUsernameMap.get(reportedAdjudication.issuingOfficer)
    const prisonerNames = this.getPrisonerDisplayNames(prisonerResult)
    const { displayName, friendlyName } = prisonerNames
    const issuingOfficer = getFormattedOfficerName(issuingOfficerName && convertToTitleCase(issuingOfficerName)) || ''
    const prisonerLocation = formatLocation(prisonerResult?.assignedLivingUnitDesc) || 'Unknown'
    const formsAlreadyIssued = !!reportedAdjudication?.dateTimeOfIssue
    const firstHearingDateTime = reportedAdjudication.dateTimeOfFirstHearing

    let relevantAlerts: AlertFlags[] = null
    if (prisonersAlerts) {
      const alertCodesPresent = new Set(prisonersAlerts.map(alert => alert.alertCode))
      relevantAlerts = alertFlagLabels.filter(alertFlag =>
        alertFlag.alertCodes.some(alert => [...alertCodesPresent].includes(alert))
      )
    }

    const formattedDisIssueHistory: FormattedDisIssue[] = []
    reportedAdjudication.disIssueHistory.map(disIssue => {
      const disIssueOfficerName = issuingOfficerNameByUsernameMap.get(disIssue.issuingOfficer)
      return formattedDisIssueHistory.push({
        issuingOfficer: getFormattedOfficerName(disIssueOfficerName && convertToTitleCase(disIssueOfficerName)) || '',
        formattedDateTimeOfIssue: formatTimestampToDate(disIssue.dateTimeOfIssue, 'D MMMM YYYY - HH:mm'),
      })
    })

    return {
      ...reportedAdjudication,
      displayName,
      friendlyName,
      issuingOfficer,
      formattedDateTimeOfIssue: formatTimestampToDate(reportedAdjudication.dateTimeOfIssue, 'D MMMM YYYY - HH:mm'),
      prisonerLocation,
      dateTimeOfDiscovery: reportedAdjudication.incidentDetails.dateTimeOfDiscovery,
      formattedDateTimeOfDiscovery: formatTimestampToDate(
        reportedAdjudication.incidentDetails.dateTimeOfDiscovery,
        'D MMMM YYYY - HH:mm'
      ),
      formsAlreadyIssued,
      dateTimeOfFirstHearing: firstHearingDateTime,
      formattedDateTimeOfFirstHearing: formatTimestampToDate(firstHearingDateTime, 'D MMMM YYYY - HH:mm'),
      issueStatus: formsAlreadyIssued ? IssueStatus.ISSUED : IssueStatus.NOT_ISSUED,
      relevantAlerts,
      formattedDisIssueHistory,
    }
  }

  async createDraftFromCompleteAdjudication(user: User, chargeNumber: string): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const newDraftAdjudicationData = await new ManageAdjudicationsSystemTokensClient(
      token,
      user
    ).createDraftFromCompleteAdjudication(chargeNumber)
    return newDraftAdjudicationData.draftAdjudication.id
  }

  async getPrisonerReport(
    user: User,
    adjudication: DraftAdjudication & ReportedAdjudication,
    draftRequired?: boolean
  ): Promise<PrisonerReport> {
    const userId = adjudication.startedByUserId ? adjudication.startedByUserId : adjudication.createdByUserId
    const reporter = await this.hmppsManageUsersClient.getUserFromUsername(userId, user.token)

    const dateTime = adjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)

    const dateTimeDiscovery = adjudication.incidentDetails.dateTimeOfDiscovery
    const dateDiscovery = getDate(dateTimeDiscovery, 'D MMMM YYYY')
    const timeDiscovery = getTime(dateTimeDiscovery)

    const [location, agencyName] = await Promise.all([
      this.locationService.getIncidentLocation(adjudication.incidentDetails.locationId, user),
      this.locationService.getAgency(adjudication.originatingAgencyId, user),
    ])

    let changeReportingOfficerLink
    let changeReportingOfficerDataQa
    if (draftRequired && !adjudication.createdOnBehalfOfOfficer) {
      changeReportingOfficerLink = `${adjudicationUrls.createOnBehalfOf.urls.start(
        adjudication.chargeNumber
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(
        adjudication.chargeNumber
      )}&editSubmittedAdjudication=true`
      changeReportingOfficerDataQa = 'reporting-officer-changeLink'
    }

    const incidentDetails = [
      {
        label: 'Reporting officer',
        value: formatReportingOfficer(reporter.name, adjudication),
        changeLinkHref: changeReportingOfficerLink,
        dataQa: changeReportingOfficerDataQa,
      },
      {
        label: 'Date of incident',
        value: date,
      },
      {
        label: 'Time of incident',
        value: time,
      },
      {
        label: 'Location',
        value: `${location?.userDescription || ''}, ${agencyName.description}`,
      },
      {
        label: 'Date of discovery',
        value: dateDiscovery,
      },
      {
        label: 'Time of discovery',
        value: timeDiscovery,
      },
    ]

    return {
      incidentDetails,
      statement: adjudication.incidentStatement?.statement,
      isYouthOffender: adjudication.isYouthOffender,
    }
  }

  async getPrisonerDetails(prisonerNumber: string, user: User): Promise<PrisonerResultSummary> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(prisonerNumber)

    const enhancedResult = {
      ...prisoner,
      friendlyName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      displayName: convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`),
      prisonerNumber: prisoner.offenderNo,
      currentLocation: formatLocation(prisoner.assignedLivingUnit.description),
    }

    return enhancedResult
  }

  async getPrisonerDetailsFromAdjNumber(chargeNumber: string, user: User): Promise<PrisonerResultSummary> {
    const reportedAdjudication = await this.getReportedAdjudicationDetails(chargeNumber, user)
    return this.getPrisonerDetails(reportedAdjudication.reportedAdjudication.prisonerNumber, user)
  }

  mapData<TI, TO>(data: ApiPageResponse<TI>, transform: (input: TI) => TO): ApiPageResponse<TO> {
    return {
      ...data,
      content: data.content.map(transform),
    }
  }

  getHearingLocationMap = async (hearings: { hearing: HearingDetails }[], user: User): Promise<Map<number, string>> => {
    const hearingLocationIds = hearings.map(hearing => hearing.hearing.locationId)
    const locationNamesAndIds =
      (await Promise.all(
        [...hearingLocationIds].map(locationId => this.locationService.getIncidentLocation(locationId, user))
      )) || []
    return new Map(locationNamesAndIds.map(loc => [loc.locationId, loc.userDescription]))
  }

  getAgencyNameMap = async (hearings: { hearing: HearingDetails }[], user: User): Promise<Map<string, string>> => {
    const agencyIds = hearings.map(hearing => hearing.hearing.agencyId)
    const agencyNamesForAgencyIds =
      (await Promise.all([...agencyIds].map(agencyId => this.locationService.getAgency(agencyId, user)))) || []
    return new Map(agencyNamesForAgencyIds.map(agency => [agency.agencyId, agency.description]))
  }

  getAdjudicatorNameMap = async (hearings: { hearing: HearingDetails }[], user: User): Promise<Map<string, string>> => {
    const governorHearings = hearings.filter(
      hearing => hearing.hearing.oicHearingType.includes('GOV') && hearing.hearing.outcome
    )
    const governorUsernames = governorHearings.map(hearing => {
      if (hearing.hearing.outcome.code === HearingOutcomeCode.NOMIS) return null
      return hearing.hearing.outcome?.adjudicator
    })
    const usernamesAndNames =
      (await Promise.all(
        [...governorUsernames].map(
          username => username && this.hmppsManageUsersClient.getUserFromUsername(username, user.token)
        )
      )) || []
    return new Map(usernamesAndNames.map(name => [name?.username, name?.name] || null))
  }

  async getOutcomesHistory(history: OutcomeHistory, user: User) {
    if (!history.length) return []
    const hearings = history.filter((item: OutcomeDetailsHistory & HearingDetailsHistory) => !!item.hearing)

    const [locationNamesByIdMap, agencyNameByLocationIdMap, governorMap] = await Promise.all([
      this.getHearingLocationMap(hearings, user),
      this.getAgencyNameMap(hearings, user),
      this.getAdjudicatorNameMap(hearings, user),
    ])

    return history.map(historyItem => {
      if (historyItem.hearing) {
        // Reconstruct the data but add the hearing location name
        const hearingLocationName = locationNamesByIdMap.get(historyItem.hearing.locationId) || ''
        const convertedGovAdjudicator = governorMap.get(historyItem.hearing.outcome?.adjudicator) || ''
        return {
          hearing: {
            ...historyItem.hearing,
            locationName: hearingLocationName
              ? `${hearingLocationName}, ${agencyNameByLocationIdMap.get(historyItem.hearing.agencyId)}`
              : `${agencyNameByLocationIdMap.get(historyItem.hearing.agencyId)}`,
            convertedAdjudicator: historyItem.hearing.oicHearingType.includes('GOV') ? convertedGovAdjudicator : null,
          },
          ...historyItem.outcome,
        }
      }
      return historyItem.outcome
    })
  }

  async deleteHearing(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).cancelHearing(chargeNumber)
  }

  async deleteCompleteHearingOutcome(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).cancelCompleteHearing(chargeNumber)
  }

  async scheduleHearing(
    chargeNumber: string,
    locationId: number,
    dateTimeOfHearing: string,
    oicHearingType: string,
    user: User
  ) {
    const dataToSend = {
      locationId,
      dateTimeOfHearing,
      oicHearingType,
    }
    return new ManageAdjudicationsUserTokensClient(user).createHearing(chargeNumber, dataToSend)
  }

  async rescheduleHearing(
    chargeNumber: string,
    locationId: number,
    dateTimeOfHearing: string,
    oicHearingType: string,
    user: User
  ) {
    const dataToSend = {
      locationId,
      dateTimeOfHearing,
      oicHearingType,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendHearing(chargeNumber, dataToSend)
  }

  async getAllHearings(chosenHearingDate: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const results = await new ManageAdjudicationsSystemTokensClient(token, user).getHearingsGivenAgencyAndDate(
      chosenHearingDate
    )

    const { hearings } = results

    const prisonerDetails = new Map(
      (await new PrisonApiClient(user.token).getBatchPrisonerDetails(hearings.map(_ => _.prisonerNumber))).map(
        prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail]
      )
    )
    const enhancedHearings = hearings.map(hearing => {
      return this.enhanceHearing(hearing, prisonerDetails.get(hearing.prisonerNumber))
    })
    return enhancedHearings
  }

  enhanceHearing(hearing: ScheduledHearing, prisonerResult: PrisonerSimpleResult) {
    const prisonerNames = this.getPrisonerDisplayNames(prisonerResult)
    const { displayName, friendlyName } = prisonerNames
    const nameAndNumber = `${displayName} - ${hearing.prisonerNumber}`
    const formattedDateTimeOfHearing = formatTimestampToDate(hearing.dateTimeOfHearing, 'D MMMM YYYY - HH:mm')
    return {
      ...hearing,
      friendlyName,
      nameAndNumber,
      formattedDateTimeOfHearing,
    }
  }

  async getAcceptedReportConfirmationDetails(chargeNumber: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const adjudicationData = await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(
      chargeNumber
    )

    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(
      adjudicationData.reportedAdjudication.prisonerNumber
    )

    return {
      reportExpirationDateTime: adjudicationData.reportedAdjudication.incidentDetails.handoverDeadline,
      prisonerFullName: formatName(prisoner.firstName, prisoner.lastName),
      transferableActionsAllowed: adjudicationData.reportedAdjudication.transferableActionsAllowed,
    }
  }

  async filterAdjudicationsByLocation(
    adjudications: ReportedAdjudicationEnhancedWithIssuingDetails[],
    chosenLocationId: LocationId,
    user: User
  ) {
    const location = await (
      await this.locationService.getLocationsForUser(user)
    ).filter(loc => loc.locationId === chosenLocationId)
    const { locationPrefix } = location[0]
    return adjudications.filter(adj => this.getLocationPrefix(adj.prisonerLocation) === locationPrefix)
  }

  getLocationPrefix = (locationCode: string) => {
    const parts = locationCode && locationCode.split('-')
    if (parts && parts.length > 0) {
      return parts.slice(0, 2).join('-')
    }
    return null
  }

  async issueDISForm(chargeNumber: string, dateTimeOfIssue: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).putDateTimeOfIssue(chargeNumber, dateTimeOfIssue)
  }

  getPrimaryButtonInfoForHearingDetails(
    history: OutcomeHistory,
    readOnly: boolean,
    chargeNumber: string
  ): { href: string; text: string; name: string; qa: string } | null {
    if (!history.length || readOnly) return null
    const finalHistoryItem = history[history.length - 1]
    if (finalHistoryItem.hearing && !finalHistoryItem.outcome) {
      if (!finalHistoryItem.hearing.outcome)
        return {
          href: adjudicationUrls.enterHearingOutcome.urls.start(chargeNumber),
          text: 'Enter the hearing outcome',
          name: 'enterHearingOutcomeButton',
          qa: 'enter-hearing-outcome-button',
        }
      if (finalHistoryItem.hearing.outcome.code === HearingOutcomeCode.ADJOURN)
        return {
          href: adjudicationUrls.scheduleHearing.urls.start(chargeNumber),
          text: 'Schedule another hearing',
          name: 'scheduleAnotherHearingButton',
          qa: 'schedule-another-hearing-button',
        }
    }
    if (finalHistoryItem.outcome) {
      if (
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_POLICE &&
        !finalHistoryItem.outcome.referralOutcome
      ) {
        return {
          href: adjudicationUrls.nextStepsPolice.urls.start(chargeNumber),
          text: 'Enter the referral outcome',
          name: 'enterReferralOutcomeButton',
          qa: 'enter-referral-outcome-button',
        }
      }
      if (
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_INAD &&
        !finalHistoryItem.outcome.referralOutcome
      ) {
        return {
          href: adjudicationUrls.nextStepsInad.urls.start(chargeNumber),
          text: 'Continue to next step',
          name: 'continueToNextStepButton',
          qa: 'continue-to-next-step-button',
        }
      }
      if (
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_GOV &&
        !finalHistoryItem.outcome.referralOutcome
      ) {
        return {
          href: adjudicationUrls.nextStepsGov.urls.start(chargeNumber),
          text: 'Continue to next step',
          name: 'continueToNextStepButton',
          qa: 'continue-to-next-step-button',
        }
      }
      if (finalHistoryItem.outcome.referralOutcome?.code === ReferralOutcomeCode.REFER_GOV) {
        return {
          href: adjudicationUrls.nextStepsGov.urls.start(chargeNumber),
          text: 'Continue to next step',
          name: 'continueToNextStepButton',
          qa: 'continue-to-next-step-button',
        }
      }
    }
    // No primary button
    return null
  }

  getSecondaryButtonInfoForHearingDetails(history: OutcomeHistory, readOnly: boolean) {
    if (!history.length || readOnly) return null
    const finalHistoryItem = history[history.length - 1]
    if (finalHistoryItem.outcome) {
      if (finalHistoryItem.hearing?.outcome.code === HearingOutcomeCode.COMPLETE) {
        return {
          text: 'Remove outcome',
          name: 'removeCompleteHearingOutcomeButton',
          value: 'removeCompleteHearingOutcome',
          qa: 'remove-complete-hearing-outcome-button',
        }
      }
      if (finalHistoryItem.outcome.outcome.code === OutcomeCode.NOT_PROCEED) {
        return {
          text: 'Remove this outcome',
          name: 'removeOutcomeButton',
          value: 'removeOutcome',
          qa: 'remove-outcome-button',
        }
      }
      if (
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_POLICE ||
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_INAD ||
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_GOV
      ) {
        return {
          text: 'Remove this referral',
          name: 'removeReferralButton',
          value: 'removeReferral',
          qa: 'remove-referral-button',
        }
      }
      if (finalHistoryItem.outcome.outcome.code === OutcomeCode.QUASHED) {
        return {
          text: 'Remove quashed finding',
          name: 'removeQuashedFindingButton',
          value: 'removeQuashedFinding',
          qa: 'remove-quashed-finding-button',
        }
      }
    }
    // Any other items that have hearing info but doesn't have an outcome
    if (finalHistoryItem.hearing) {
      if (finalHistoryItem.hearing.outcome && finalHistoryItem.hearing.outcome.code === HearingOutcomeCode.ADJOURN) {
        return {
          text: 'Remove outcome',
          name: 'removeAdjournHearingOutcomeButton',
          value: 'removeAdjournHearingOutcome',
          qa: 'remove-adjourn-hearing-button',
        }
      }
      return {
        text: 'Remove this hearing',
        name: 'removeHearingButton',
        value: 'removeHearing',
        qa: 'remove-hearing-button',
      }
    }
    return null
  }

  getTertiaryButtonInfoForHearingDetails(history: OutcomeHistory, readOnly: boolean, chargeNumber: string) {
    if (!history.length || readOnly) return null
    const finalHistoryItem = history[history.length - 1]
    if (finalHistoryItem.outcome?.outcome.code === OutcomeCode.CHARGE_PROVED) {
      return {
        href: adjudicationUrls.reportAQuashedGuiltyFinding.urls.start(chargeNumber),
        text: 'Report a quashed guilty finding',
        name: 'reportQuashedFinding',
        value: 'reportQuashedFinding',
        qa: 'report-quashed-finding',
      }
    }
    return null
  }

  async getLastOutcomeItem(
    chargeNumber: string,
    acceptableStatuses: ReportedAdjudicationStatus[],
    user: User
  ): Promise<OutcomeDetailsHistory | HearingDetailsHistory | Record<string, never>> {
    const adjudication = await this.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    if (!acceptableStatuses.includes(reportedAdjudication.status)) return {}
    if (!reportedAdjudication.outcomes) throw new Error(`Missing outcomes data`)
    return reportedAdjudication.outcomes[reportedAdjudication.outcomes.length - 1]
  }

  async getLatestHearing(chargeNumber: string, user: User): Promise<HearingDetails | Record<string, never>> {
    const { reportedAdjudication } = await this.getReportedAdjudicationDetails(chargeNumber, user)
    if (!reportedAdjudication.hearings?.length) return {}
    return reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1]
  }

  async getLatestNonMatchingHearing(
    chargeNumber: string,
    hearingIdToSkip: number,
    user: User
  ): Promise<HearingDetails | Record<string, never>> {
    try {
      const { reportedAdjudication } = await this.getReportedAdjudicationDetails(chargeNumber, user)
      const { hearings } = reportedAdjudication
      const filteredHearings = hearings.filter(hearing => hearing.id !== hearingIdToSkip)
      const latestHearing = filteredHearings.pop() || {}
      return latestHearing
    } catch (error) {
      return {}
    }
  }

  async getAgencyReportCounts(user: User): Promise<AgencyReportCounts> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).getAgencyReportCounts()
  }

  async getPrisonerLatestADMMovement(
    prisonerNo: string,
    overrideAgencyId: string,
    user: User
  ): Promise<OffenderBannerInfo> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [movementInfo, prisoner] = await Promise.all([
      new PrisonApiClient(token).getMovementByOffender(prisonerNo),
      new PrisonApiClient(user.token).getPrisonerDetails(prisonerNo),
    ])
    const moveToOverrideAgencyIdList = movementInfo.filter(prisonerMove => prisonerMove.toAgency === overrideAgencyId)
    if (!moveToOverrideAgencyIdList.length) return null
    const { movementDate, toAgencyDescription } = moveToOverrideAgencyIdList[0]
    const convertedMovementDate = formatTimestampTo(movementDate, 'D MMMM YYYY')
    return {
      movementDate: convertedMovementDate,
      toAgencyDescription,
      prisonerName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
    }
  }

  private getBannerText = async (
    overrideAgencyId: string,
    originatingAgencyId: string,
    prisonerNumber: string,
    user: User
  ) => {
    if (!overrideAgencyId || !overrideAgencyId.length) return null
    // Prisoner has been transferred and current user is in the agency where the adjudication was first reported
    if (user.meta.caseLoadId === originatingAgencyId) {
      try {
        const movementData = await this.getPrisonerLatestADMMovement(prisonerNumber, overrideAgencyId, user)
        const { movementDate, prisonerName, toAgencyDescription } = movementData
        return movementData
          ? `${prisonerName} was transferred to ${toAgencyDescription} on ${movementDate}`
          : `This prisoner was transferred to another establishment.`
      } catch {
        return null
      }
    }
    // Prisoner has been transferred and current user is in the override agency
    if (user.meta.caseLoadId === overrideAgencyId) {
      try {
        const agencyName =
          (await this.locationService.getAgency(originatingAgencyId, user))?.description || 'another establishment.'
        return `This incident was reported at ${agencyName}`
      } catch {
        return null
      }
    }
    return null
  }

  async getTransferBannerInfo(reportedAdjudication: ReportedAdjudication, user: User) {
    const { overrideAgencyId, originatingAgencyId, prisonerNumber, status, transferableActionsAllowed } =
      reportedAdjudication
    const transferBannerContent = await this.getBannerText(overrideAgencyId, originatingAgencyId, prisonerNumber, user)

    const originatingAgencyToAddOutcome =
      status === ReportedAdjudicationStatus.SCHEDULED &&
      user.meta.caseLoadId === reportedAdjudication.overrideAgencyId &&
      transferableActionsAllowed === false
    return {
      transferBannerContent,
      originatingAgencyToAddOutcome,
    }
  }

  async canViewPrintAndIssueFormsTab(userRoles: string[], status: ReportedAdjudicationStatus): Promise<boolean> {
    return (
      hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles) &&
      ![
        ReportedAdjudicationStatus.AWAITING_REVIEW,
        ReportedAdjudicationStatus.REJECTED,
        ReportedAdjudicationStatus.RETURNED,
      ].includes(status)
    )
  }

  async getAwardedPunishmentsAndDamages(
    filter: AwardedPunishmentsAndDamagesFilter,
    possibleLocations: Location[],
    userIsALO: boolean,
    user: User
  ): Promise<AwardedPunishmentsAndDamages[]> {
    const hearingForDateByChargeNumber = new Map(
      (await this.getAllHearings(filter.hearingDate, user)).map(hearing => [hearing.chargeNumber, hearing])
    )

    const adjudicationsForHearings = await Promise.all(
      Array.from(hearingForDateByChargeNumber.keys()).flatMap(chargeNumber => {
        return this.getReportedAdjudicationDetails(chargeNumber, user)
      })
    )

    const prisonerNumbers = adjudicationsForHearings.map(
      reportedAdjudicationResult => reportedAdjudicationResult.reportedAdjudication.prisonerNumber
    )
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisonerDetails = new Map(
      (await new PrisonApiClient(token).getBatchPrisonerDetails(prisonerNumbers)).map(prisonerDetail => [
        prisonerDetail.offenderNo,
        prisonerDetail,
      ])
    )

    let awardedPunishmentsAndDamages: AwardedPunishmentsAndDamages[] = adjudicationsForHearings.map(
      reportedAdjudicationResult =>
        this.buildAwardedPunishmentsAndDamages(
          reportedAdjudicationResult,
          hearingForDateByChargeNumber,
          prisonerDetails,
          userIsALO
        )
    )

    if (filter.locationId) {
      const location = possibleLocations.filter(loc => loc.locationId === filter.locationId)
      const { locationPrefix } = location[0]
      awardedPunishmentsAndDamages = awardedPunishmentsAndDamages.filter(
        apad => this.getLocationPrefix(apad.prisonerLocation) === locationPrefix
      )
    }

    const displayForAdjudicationStatuses = [
      ReportedAdjudicationStatus.CHARGE_PROVED,
      ReportedAdjudicationStatus.ADJOURNED,
      ReportedAdjudicationStatus.REFER_POLICE,
      ReportedAdjudicationStatus.REFER_GOV,
      ReportedAdjudicationStatus.REFER_INAD,
      ReportedAdjudicationStatus.DISMISSED,
      ReportedAdjudicationStatus.QUASHED,
    ]

    awardedPunishmentsAndDamages = awardedPunishmentsAndDamages.filter(result =>
      displayForAdjudicationStatuses.includes(result.status)
    )

    return awardedPunishmentsAndDamages
  }

  private getActionLinkForAwardedPunishmentsAndDamages = (adjudication: ReportedAdjudication, userIsALO: boolean) => {
    if (adjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED) {
      if (userIsALO)
        return {
          link: adjudicationUrls.punishmentsAndDamages.urls.review(adjudication.chargeNumber),
          text: 'View punishments',
        }
      return {
        link: adjudicationUrls.punishmentsAndDamages.urls.report(adjudication.chargeNumber),
        text: 'View punishments',
      }
    }
    if (userIsALO)
      return { link: adjudicationUrls.hearingDetails.urls.review(adjudication.chargeNumber), text: 'View hearings' }
    return { link: adjudicationUrls.hearingDetails.urls.report(adjudication.chargeNumber), text: 'View hearings' }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private buildAwardedPunishmentsAndDamages(
    adj: ReportedAdjudicationResult,
    hearingForDateByChargeNumber: Map<string, any>,
    prisonerDetails: Map<string, PrisonerSimpleResult>,
    userIsALO: boolean
  ): AwardedPunishmentsAndDamages {
    const adjudication = adj.reportedAdjudication
    const hearingForAdjudication = hearingForDateByChargeNumber.get(adjudication.chargeNumber)

    let caution = 'No'
    adjudication.punishments.forEach(punishment => {
      if (punishment.type === PunishmentType.CAUTION) {
        caution = 'Yes'
      }
    })

    let damagesOwedAmount
    let sumDamagesOwed = 0
    adjudication.punishments.forEach(punishment => {
      if (punishment.damagesOwedAmount) {
        sumDamagesOwed += punishment.damagesOwedAmount
      }
    })
    if (sumDamagesOwed > 0) {
      damagesOwedAmount = '£'.concat(sumDamagesOwed.toString())
    }

    const financialPunishmentTypes = [PunishmentType.DAMAGES_OWED, PunishmentType.EARNINGS]
    const financialPunishmentCount = adjudication.punishments.filter(punishment =>
      financialPunishmentTypes.includes(punishment.type)
    ).length

    let additionalDays = 0
    let prospectiveAdditionalDays = 0
    adjudication.punishments.forEach(punishment => {
      if (punishment.type === PunishmentType.ADDITIONAL_DAYS) {
        additionalDays += punishment.schedule.days
      }
      if (punishment.type === PunishmentType.PROSPECTIVE_DAYS) {
        prospectiveAdditionalDays += punishment.schedule.days
      }
    })

    const actionLink = this.getActionLinkForAwardedPunishmentsAndDamages(adjudication, userIsALO)

    return {
      chargeNumber: adjudication.chargeNumber,
      nameAndNumber: hearingForAdjudication.nameAndNumber,
      prisonerLocation:
        formatLocation(prisonerDetails.get(adjudication.prisonerNumber)?.assignedLivingUnitDesc) || 'Unknown',
      formattedDateTimeOfHearing: formatTimestampToDate(
        hearingForAdjudication.dateTimeOfHearing,
        'D MMMM YYYY - HH:mm'
      ),
      status: adjudication.status,
      caution,
      financialPunishmentCount,
      punishmentCount: adjudication.punishments.length,
      damagesOwedAmount,
      additionalDays,
      prospectiveAdditionalDays,
      reportHref: actionLink,
    }
  }

  async getUniqueListOfAgenciesForPrisoner(prisonerNumber: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const movementInfo = await new PrisonApiClient(token).getMovementByOffender(prisonerNumber)
    // Sometimes the 'agencyTo' doesn't always match the 'agencyFrom' on the next entry, so I'm getting everything
    const allAgencyIdsForPrisoner = movementInfo.map(bookings => {
      return [bookings.fromAgency, bookings.toAgency]
    })
    const uniqueAgencyIds = Array.from(new Set(allAgencyIdsForPrisoner.flat()))
    const agencyInformation = uniqueAgencyIds.map(chosenAgency => {
      if (chosenAgency === 'OUT') return null
      // Now we have a unique set of agency ids, we can match them to their descriptions
      const matchingAgencyInfo = movementInfo.find(
        node => node.fromAgency === chosenAgency || node.toAgency === chosenAgency
      )
      if (matchingAgencyInfo) {
        return {
          agency: chosenAgency,
          agencyDescription:
            matchingAgencyInfo.fromAgency === chosenAgency
              ? matchingAgencyInfo.fromAgencyDescription
              : matchingAgencyInfo.toAgencyDescription,
        }
      }

      return null
    })
    // remove any nulls
    return agencyInformation.filter(agency => agency)
  }

  async getAdjudicationHistory(
    prisoner: PrisonerResultSummary,
    uniqueListOfAgenciesForPrisoner: EstablishmentInformation[],
    filter: AdjudicationHistoryFilter,
    pageRequest: ApiPageRequest,
    user: User
  ): Promise<ApiPageResponse<ReportedAdjudication>> {
    const userRoles = await this.userService.getUserRoles(user.token)
    let { token } = user
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    }
    const agencyIds = uniqueListOfAgenciesForPrisoner.map(agencyInfo => agencyInfo.agency)

    let results = {} as ApiPageResponse<ReportedAdjudication>
    if (filter.bookingType === AdjudicationHistoryBookingType.ALL) {
      results = await new ManageAdjudicationsSystemTokensClient(token, user).getPrisonerAdjudicationHistoryAllBookings(
        prisoner.prisonerNumber,
        filter,
        pageRequest
      )
    } else {
      results = await new ManageAdjudicationsSystemTokensClient(token, user).getPrisonerAdjudicationHistory(
        prisoner.bookingId,
        filter,
        agencyIds,
        pageRequest
      )
    }

    return results
  }

  async getDis5Data(
    chargeNumber: string,
    prisonerNumber: string,
    bookingId: number,
    user: User
  ): Promise<Dis5AdjudicationsAndMoneyPrintSupport> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)

    const [adjudicationsData, damageObligations, balances] = await Promise.all([
      new ManageAdjudicationsSystemTokensClient(token, user).getDataForDis5(chargeNumber),
      new PrisonApiClient(token).getDamageObligation(prisonerNumber),
      new PrisonApiClient(token).getBalances(bookingId),
    ])

    return {
      ...adjudicationsData,
      ...damageObligations,
      balances,
    }
  }
}
