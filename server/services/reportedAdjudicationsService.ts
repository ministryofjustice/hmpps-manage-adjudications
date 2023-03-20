import { ConfirmedOnReportData, ConfirmedOnReportChangedData } from '../data/ConfirmedOnReportData'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import CuriousApiService from './curiousApiService'
import {
  ReportedAdjudication,
  ReportedAdjudicationEnhanced,
  ReportedAdjudicationFilter,
  ReportedAdjudicationResult,
  reportedAdjudicationStatusDisplayName,
  ReportedAdjudicationStatus,
  ScheduledHearing,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationEnhancedWithIssuingDetails,
  IssueStatus,
  ReportedAdjudicationsResult,
} from '../data/ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import {
  convertToTitleCase,
  getDate,
  getFormattedOfficerName,
  getTime,
  formatTimestampToDate,
  formatLocation,
  formatTimestampTo,
  formatName,
  convertOicHearingType,
} from '../utils/utils'
import { LocationId, PrisonLocation } from '../data/PrisonLocationResult'
import {
  PrisonerReport,
  DraftAdjudication,
  DamageDetails,
  EvidenceDetails,
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

function getNonEnglishLanguage(primaryLanguage: string): string {
  if (!primaryLanguage || primaryLanguage === 'English') {
    return null
  }
  return primaryLanguage
}

export default class ReportedAdjudicationsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly curiousApiService: CuriousApiService,
    private readonly locationService: LocationService
  ) {}

  async getReportedAdjudicationDetails(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
  }

  async getReviewDetails(adjudicationData: ReportedAdjudicationResult, user: User) {
    const { reportedAdjudication } = adjudicationData

    if (reportedAdjudication.status === ReportedAdjudicationStatus.AWAITING_REVIEW)
      return { reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status) }

    const reviewingOfficer =
      reportedAdjudication.reviewedByUserId &&
      (await this.hmppsAuthClient.getUserFromUsername(reportedAdjudication.reviewedByUserId, user.token))

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

  async getConfirmationDetails(adjudicationNumber: number, user: User): Promise<ConfirmedOnReportData> {
    const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [prisoner, secondaryLanguages, prisonerNeurodiversities] = await Promise.all([
      new PrisonApiClient(token).getPrisonerDetails(adjudicationData.reportedAdjudication.prisonerNumber),
      new PrisonApiClient(token).getSecondaryLanguages(adjudicationData.reportedAdjudication.bookingId),
      this.curiousApiService.getNeurodiversitiesForReport(adjudicationData.reportedAdjudication.prisonerNumber, token),
    ])

    const prisonerPreferredNonEnglishLanguage = getNonEnglishLanguage(prisoner.language)
    const prisonerOtherLanguages = secondaryLanguages?.map(l => l.description)

    const location = await this.locationService.getIncidentLocation(
      adjudicationData.reportedAdjudication.incidentDetails.locationId,
      user
    )
    const agencyDescription = await this.locationService.getAgency(location.agencyId, user)

    const reporter = await this.hmppsAuthClient.getUserFromUsername(
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

  async getSimpleConfirmationDetails(adjudicationNumber: number, user: User): Promise<ConfirmedOnReportChangedData> {
    const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(
      adjudicationData.reportedAdjudication.prisonerNumber
    )
    const reporter = await this.hmppsAuthClient.getUserFromUsername(
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
    const pageResponse = await new ManageAdjudicationsClient(user.token).getYourCompletedAdjudications(
      user.activeCaseLoadId,
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
    const pageResponse = await new ManageAdjudicationsClient(user.token).getAllCompletedAdjudications(
      user.activeCaseLoadId,
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
        [...usernamesInPage].map(username => this.hmppsAuthClient.getUserFromUsername(username, user.token))
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
    if (filterUsingHearingDate) {
      return new ManageAdjudicationsClient(user.token).getReportedAdjudicationPrintData(user.activeCaseLoadId, filter)
    }
    return new ManageAdjudicationsClient(user.token).getReportedAdjudicationIssueData(user.activeCaseLoadId, filter)
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
        [...usernamesInPage].map(username => this.hmppsAuthClient.getUserFromUsername(username, user.token))
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
    adjudicationNumber: number,
    status: ReviewStatus,
    reason: string,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).updateAdjudicationStatus(adjudicationNumber, {
      status,
      statusReason: reason,
      statusDetails: details,
    })
  }

  async updateDamageDetails(
    adjudicationNumber: number,
    damages: DamageDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).updateDamageDetails(adjudicationNumber, damages)
  }

  async updateEvidenceDetails(
    adjudicationNumber: number,
    evidence: EvidenceDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).updateEvidenceDetails(adjudicationNumber, evidence)
  }

  async updateWitnessDetails(
    adjudicationNumber: number,
    witnesses: WitnessDetails[],
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).updateWitnessDetails(adjudicationNumber, witnesses)
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

  async createDraftFromCompleteAdjudication(user: User, adjudicationNumber: number): Promise<number> {
    const newDraftAdjudicationData = await new ManageAdjudicationsClient(
      user.token
    ).createDraftFromCompleteAdjudication(adjudicationNumber)
    return newDraftAdjudicationData.draftAdjudication.id
  }

  async getPrisonerReport(
    user: User,
    locations: PrisonLocation[],
    draftAdjudication: DraftAdjudication
  ): Promise<PrisonerReport> {
    const reporter = await this.hmppsAuthClient.getUserFromUsername(draftAdjudication.startedByUserId, user.token)

    const dateTime = draftAdjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)

    const dateTimeDiscovery = draftAdjudication.incidentDetails.dateTimeOfDiscovery
    const dateDiscovery = getDate(dateTimeDiscovery, 'D MMMM YYYY')
    const timeDiscovery = getTime(dateTimeDiscovery)

    const [locationObj] = locations.filter(loc => loc.locationId === draftAdjudication.incidentDetails.locationId)

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
        value: locationObj?.userDescription || '',
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
      statement: draftAdjudication.incidentStatement?.statement,
      isYouthOffender: draftAdjudication.isYouthOffender,
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

  async getPrisonerDetailsFromAdjNumber(adjudicationNumber: number, user: User): Promise<PrisonerResultSummary> {
    const reportedAdjudication = await this.getReportedAdjudicationDetails(adjudicationNumber, user)
    return this.getPrisonerDetails(reportedAdjudication.reportedAdjudication.prisonerNumber, user)
  }

  mapData<TI, TO>(data: ApiPageResponse<TI>, transform: (input: TI) => TO): ApiPageResponse<TO> {
    return {
      ...data,
      content: data.content.map(transform),
    }
  }

  async getHearingDetails(hearings: HearingDetails[], user: User) {
    if (!hearings.length) return []
    const locationIds = new Set(hearings.map(hearing => hearing.locationId))
    const locationNamesAndIds =
      (await Promise.all(
        [...locationIds].map(locationId => this.locationService.getIncidentLocation(locationId, user))
      )) || []

    const locationNamesByIdMap = new Map(locationNamesAndIds.map(loc => [loc.locationId, loc.userDescription]))

    return hearings.map(hearing => {
      return {
        id: hearing.id,
        dateTime: {
          label: 'Date and time of hearing',
          value: formatTimestampTo(hearing.dateTimeOfHearing, 'D MMMM YYYY - HH:mm'),
        },
        location: {
          label: 'Location',
          value: locationNamesByIdMap.get(hearing.locationId),
        },
        type: {
          label: 'Type of hearing',
          value: convertOicHearingType(hearing.oicHearingType),
        },
      }
    })
  }

  getHearingLocationMap = async (hearings: { hearing: HearingDetails }[], user: User): Promise<Map<number, string>> => {
    const hearingLocationIds = hearings.map(hearing => hearing.hearing.locationId)
    const locationNamesAndIds =
      (await Promise.all(
        [...hearingLocationIds].map(locationId => this.locationService.getIncidentLocation(locationId, user))
      )) || []
    return new Map(locationNamesAndIds.map(loc => [loc.locationId, loc.userDescription]))
  }

  async getOutcomesHistory(history: OutcomeHistory, user: User) {
    if (!history.length) return []
    const hearings = history.filter((item: OutcomeDetailsHistory & HearingDetailsHistory) => !!item.hearing)
    const locationNamesByIdMap = await this.getHearingLocationMap(hearings, user)
    return history.map(historyItem => {
      if (historyItem.hearing) {
        // Reconstruct the data but add the hearing location name
        return {
          hearing: {
            ...historyItem.hearing,
            locationName: locationNamesByIdMap.get(historyItem.hearing.locationId),
          },
          ...historyItem.outcome,
        }
      }
      return historyItem.outcome
    })
  }

  async deleteHearingV1(
    adjudicationNumber: number,
    hearingIdToCancel: number,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).cancelHearingV1(adjudicationNumber, hearingIdToCancel)
  }

  async deleteHearing(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).cancelHearing(adjudicationNumber)
  }

  async deleteCompleteHearingOutcome(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).cancelCompleteHearing(adjudicationNumber)
  }

  async scheduleHearingV1(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).createHearingV1(adjudicationNumber, dataToSend)
  }

  async scheduleHearing(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).createHearing(adjudicationNumber, dataToSend)
  }

  async rescheduleHearingV1(
    adjudicationNumber: number,
    hearingId: number,
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
    return new ManageAdjudicationsClient(user.token).amendHearingV1(adjudicationNumber, hearingId, dataToSend)
  }

  async rescheduleHearing(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).amendHearing(adjudicationNumber, dataToSend)
  }

  async getAllHearings(chosenHearingDate: string, user: User) {
    const agencyId = user.activeCaseLoadId
    const results = await new ManageAdjudicationsClient(user.token).getHearingsGivenAgencyAndDate(
      agencyId,
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
    const friendlyName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || 'Unknown'
    const nameAndNumber = `${friendlyName} - ${hearing.prisonerNumber}`
    const formattedDateTimeOfHearing = formatTimestampToDate(hearing.dateTimeOfHearing, 'D MMMM YYYY - HH:mm')
    const formattedDateTimeOfDiscovery = formatTimestampToDate(hearing.dateTimeOfDiscovery, 'D MMMM YYYY - HH:mm')
    return {
      ...hearing,
      friendlyName,
      nameAndNumber,
      formattedDateTimeOfHearing,
      formattedDateTimeOfDiscovery,
    }
  }

  async getAcceptedReportConfirmationDetails(adjudicationNumber: number, user: User) {
    const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(
      adjudicationData.reportedAdjudication.prisonerNumber
    )

    return {
      reportExpirationDateTime: adjudicationData.reportedAdjudication.incidentDetails.handoverDeadline,
      prisonerFullName: formatName(prisoner.firstName, prisoner.lastName),
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

  async issueDISForm(adjudicationNumber: number, dateTimeOfIssue: string, user: User) {
    return new ManageAdjudicationsClient(user.token).putDateTimeOfIssue(adjudicationNumber, dateTimeOfIssue)
  }

  getPrimaryButtonInfoForHearingDetails(
    history: OutcomeHistory,
    readOnly: boolean,
    adjudicationNumber: number
  ): { href: string; text: string; name: string; qa: string } | null {
    if (!history.length || readOnly) return null
    const finalHistoryItem = history[history.length - 1]
    if (finalHistoryItem.hearing && !finalHistoryItem.outcome) {
      if (!finalHistoryItem.hearing.outcome)
        return {
          href: adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber),
          text: 'Enter the hearing outcome',
          name: 'enterHearingOutcomeButton',
          qa: 'enter-hearing-outcome-button',
        }
      if (finalHistoryItem.hearing.outcome.code === HearingOutcomeCode.ADJOURN)
        return {
          href: adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber),
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
          href: adjudicationUrls.nextStepsPolice.urls.start(adjudicationNumber),
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
          href: adjudicationUrls.nextStepsInad.urls.start(adjudicationNumber),
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

  getTertiaryButtonInfoForHearingDetails(history: OutcomeHistory, readOnly: boolean, adjudicationNumber: number) {
    if (!history.length || readOnly) return null
    const finalHistoryItem = history[history.length - 1]
    if (finalHistoryItem.outcome?.outcome.code === OutcomeCode.CHARGE_PROVED) {
      return {
        href: adjudicationUrls.reportAQuashedGuiltyFinding.urls.start(adjudicationNumber),
        text: 'Report a quashed guilty finding',
        name: 'reportQuashedFinding',
        value: 'reportQuashedFinding',
        qa: 'report-quashed-finding',
      }
    }
    return null
  }

  async getLastOutcomeItem(
    adjudicationNumber: number,
    acceptableStatuses: ReportedAdjudicationStatus[],
    user: User
  ): Promise<OutcomeDetailsHistory | HearingDetailsHistory | Record<string, never>> {
    const adjudication = await this.getReportedAdjudicationDetails(adjudicationNumber, user)
    const { reportedAdjudication } = adjudication
    if (!acceptableStatuses.includes(reportedAdjudication.status)) return {}
    if (!reportedAdjudication.outcomes) throw new Error(`Missing outcomes data`)
    return reportedAdjudication.outcomes[reportedAdjudication.outcomes.length - 1]
  }
}
