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
} from '../utils/utils'
import { LocationId, PrisonLocation } from '../data/PrisonLocationResult'
import {
  PrisonerReport,
  DraftAdjudication,
  DamageDetails,
  EvidenceDetails,
  WitnessDetails,
  HearingDetails,
} from '../data/DraftAdjudicationResult'
import LocationService from './locationService'
import { ReviewStatus } from '../routes/prisonerReport/prisonerReportReviewValidation'
import { PrisonerResultSummary } from './placeOnReportService'
import PrisonerSimpleResult from '../data/prisonerSimpleResult'

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

  async getAdjudicationDISFormData(
    user: User,
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationEnhancedWithIssuingDetails[]> {
    const response = await new ManageAdjudicationsClient(user.token).getReportedAdjudicationIssueData(
      user.activeCaseLoadId,
      filter
    )
    const { reportedAdjudications } = response
    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(reportedAdjudications.map(_ => _.prisonerNumber))
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

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
        IssuingOfficerNameByUsernameMap.get(reportedAdjudication.issuingOfficer)
      )
    })
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
    issuingOfficerName: string
  ): ReportedAdjudicationEnhancedWithIssuingDetails {
    const prisonerNames = this.getPrisonerDisplayNames(prisonerResult)
    const { displayName, friendlyName } = prisonerNames
    const issuingOfficer = getFormattedOfficerName(issuingOfficerName && convertToTitleCase(issuingOfficerName)) || ''
    const prisonerLocation = formatLocation(prisonerResult.assignedLivingUnitDesc)
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
      formsAlreadyIssued: !!reportedAdjudication?.dateTimeOfIssue,
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
      }
    })
  }

  async deleteHearing(
    adjudicationNumber: number,
    hearingIdToCancel: number,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).cancelHearing(adjudicationNumber, hearingIdToCancel)
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

  async rescheduleHearing(
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
    return new ManageAdjudicationsClient(user.token).amendHearing(adjudicationNumber, hearingId, dataToSend)
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
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || ''
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
}
