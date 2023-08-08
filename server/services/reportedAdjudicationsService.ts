import { ConfirmedOnReportChangedData, ConfirmedOnReportData } from '../data/ConfirmedOnReportData'
import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient, { OffenderBannerInfo } from '../data/prisonApiClient'
import ManageAdjudicationsSystemTokensClient, {
  AgencyReportCounts,
} from '../data/manageAdjudicationsSystemTokensClient'
import CuriousApiService from './curiousApiService'
import {
  IssueStatus,
  ReportedAdjudication,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationEnhanced,
  ReportedAdjudicationEnhancedWithIssuingDetails,
  ReportedAdjudicationFilter,
  ReportedAdjudicationResult,
  ReportedAdjudicationResultV2,
  ReportedAdjudicationsResult,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
  ScheduledHearing,
} from '../data/ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import {
  convertToTitleCase,
  formatLocation,
  formatName,
  formatTimestampTo,
  formatTimestampToDate,
  getDate,
  getFormattedOfficerName,
  getTime,
} from '../utils/utils'
import { LocationId } from '../data/PrisonLocationResult'
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
} from '../data/HearingAndOutcomeResult'
import adjudicationUrls from '../utils/urlGenerator'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import config from '../config'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

function getNonEnglishLanguage(primaryLanguage: string): string {
  if (!primaryLanguage || primaryLanguage === 'English') {
    return null
  }
  return primaryLanguage
}

export default class ReportedAdjudicationsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient,
    private readonly curiousApiService: CuriousApiService,
    private readonly locationService: LocationService
  ) {}

  async getReportedAdjudicationDetails(
    chargeNumber: string,
    user: User
  ): Promise<ReportedAdjudicationResult | ReportedAdjudicationResultV2> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return config.v2EndpointsFlag === 'true'
      ? new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudicationV2(chargeNumber)
      : new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(chargeNumber)
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
      }
    })
  }

  async getAllCompletedAdjudications(
    user: User,
    filter: ReportedAdjudicationFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudicationEnhanced>> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const pageResponse = await new ManageAdjudicationsSystemTokensClient(token, user).getAllCompletedAdjudications(
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

    return this.mapData(pageResponse, reportedAdjudication => {
      const enhancedAdjudication = this.enhanceReportedAdjudication(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        reporterNameByUsernameMap.get(reportedAdjudication.createdByUserId)
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
    const IssuingOfficerNameByUsernameMap = new Map(issuingOfficerNamesAndUsernames.map(u => [u.username, u.name]))

    return reportedAdjudications.map(reportedAdjudication => {
      return this.enhanceAdjudicationWithIssuingDetails(
        reportedAdjudication,
        prisonerDetails.get(reportedAdjudication.prisonerNumber),
        IssuingOfficerNameByUsernameMap.get(reportedAdjudication.issuingOfficer),
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
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).updateAdjudicationStatus(chargeNumber, {
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

  enhanceReportedAdjudication(
    reportedAdjudication: ReportedAdjudication,
    prisonerResult: PrisonerSimpleResult,
    reporterName: string
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
    issuingOfficerName: string,
    prisonersAlerts: Alert[] = []
  ): ReportedAdjudicationEnhancedWithIssuingDetails {
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

  async getPrisonerReport(user: User, adjudication: DraftAdjudication & ReportedAdjudication): Promise<PrisonerReport> {
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

    const incidentDetails = [
      {
        label: 'Reporting Officer',
        value: getFormattedOfficerName(reporter.name),
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
        const convertedGovAdjudicator = governorMap.get(historyItem.hearing.outcome?.adjudicator) || 'Entered in NOMIS'
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
    const results = await new ManageAdjudicationsUserTokensClient(user).getHearingsGivenAgencyAndDate(chosenHearingDate)

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
        finalHistoryItem.outcome.outcome.code === OutcomeCode.REFER_INAD
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

  async getAgencyReportCounts(user: User): Promise<AgencyReportCounts> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).getAgencyReportCounts()
  }

  async getPrisonerLatestADMMovement(
    prisonerNo: string,
    overrideAgencyId: string,
    user: User
  ): Promise<OffenderBannerInfo> {
    const [movementInfo, prisoner] = await Promise.all([
      new PrisonApiClient(user.token).getMovementByOffender(prisonerNo),
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
    if (user.activeCaseLoadId === originatingAgencyId) {
      try {
        const movementData = await this.getPrisonerLatestADMMovement(prisonerNumber, 'LEI', user)
        const { movementDate, prisonerName, toAgencyDescription } = movementData
        return movementData
          ? `${prisonerName} was transferred to ${toAgencyDescription} on ${movementDate}`
          : `This prisoner was transferred to another establishment.`
      } catch {
        return null
      }
    }
    // Prisoner has been transferred and current user is in the override agency
    if (user.activeCaseLoadId === overrideAgencyId) {
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
      user.activeCaseLoadId === reportedAdjudication.overrideAgencyId &&
      transferableActionsAllowed === false
    return {
      transferBannerContent,
      originatingAgencyToAddOutcome,
    }
  }
}
