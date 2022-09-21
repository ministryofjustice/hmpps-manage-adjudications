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
} from '../data/ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import { convertToTitleCase, getDate, getFormattedOfficerName, getTime, formatTimestampToDate } from '../utils/utils'
import PrisonerSimpleResult from '../data/prisonerSimpleResult'
import { PrisonLocation } from '../data/PrisonLocationResult'
import { PrisonerReport, DraftAdjudication, DamageDetails } from '../data/DraftAdjudicationResult'
import LocationService from './locationService'
import { ReviewStatus } from '../routes/prisonerReport/prisonerReportReviewValidation'

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

  async getConfirmationDetailsChangedReport(
    adjudicationNumber: number,
    user: User
  ): Promise<ConfirmedOnReportChangedData> {
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

  enhanceReportedAdjudication(
    reportedAdjudication: ReportedAdjudication,
    prisonerResult: PrisonerSimpleResult,
    reporterName: string
  ): ReportedAdjudicationEnhanced {
    const displayName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.lastName}, ${prisonerResult.firstName}`)) || ''
    const friendlyName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || ''
    const reportingOfficer = (reporterName && convertToTitleCase(reporterName)) || ''

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
      statusDisplayName: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
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

    const [locationObj] = locations.filter(loc => loc.locationId === draftAdjudication.incidentDetails.locationId)

    const incidentDetails = [
      {
        label: 'Reporting Officer',
        value: getFormattedOfficerName(reporter.name),
      },
      {
        label: 'Date',
        value: date,
      },
      {
        label: 'Time',
        value: time,
      },
      {
        label: 'Location',
        value: locationObj?.userDescription || '',
      },
    ]

    return {
      incidentDetails,
      statement: draftAdjudication.incidentStatement?.statement,
      isYouthOffender: draftAdjudication.isYouthOffender,
    }
  }

  mapData<TI, TO>(data: ApiPageResponse<TI>, transform: (input: TI) => TO): ApiPageResponse<TO> {
    return {
      ...data,
      content: data.content.map(transform),
    }
  }
}
