/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'
import {
  DamageDetails,
  DraftAdjudication,
  EvidenceDetails,
  HearingDetails,
  IncidentRole,
  IncidentStatement,
  OffenceDetails,
  PrisonerGender,
  WitnessDetails,
} from '../../data/DraftAdjudicationResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import PrisonerSimpleResult from '../../data/prisonerSimpleResult'
import { Location } from '../../data/PrisonLocationResult'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import { alertFlagLabels, AlertFlags } from '../../utils/alertHelper'

export default class TestData {
  reportedAdjudication = ({
    adjudicationNumber,
    prisonerNumber,
    dateTimeOfIncident = '2023-01-01T06:00:00',
    gender = PrisonerGender.MALE,
    dateTimeOfDiscovery = dateTimeOfIncident,
    locationId = 1,
    incidentStatement = {} as IncidentStatement,
    offenceDetails = {} as OffenceDetails,
    incidentRole = {} as IncidentRole,
    status = ReportedAdjudicationStatus.AWAITING_REVIEW,
    isYouthOffender = false,
    damages = [],
    evidence = [],
    witnesses = [],
    hearings = null,
    dateTimeOfFirstHearing = null,
    issuingOfficer = null,
    dateTimeOfIssue = null,
    otherData,
  }: {
    adjudicationNumber: number
    prisonerNumber: string
    dateTimeOfIncident?: string
    gender?: PrisonerGender
    dateTimeOfDiscovery?: string
    locationId?: number
    incidentStatement?: IncidentStatement
    offenceDetails?: OffenceDetails
    incidentRole?: IncidentRole
    status?: ReportedAdjudicationStatus
    isYouthOffender?: boolean
    damages?: DamageDetails[]
    evidence?: EvidenceDetails[]
    witnesses?: WitnessDetails[]
    hearings?: HearingDetails[]
    dateTimeOfFirstHearing?: string
    issuingOfficer?: string
    dateTimeOfIssue?: string
    otherData?: any
  }) => {
    return {
      adjudicationNumber,
      prisonerNumber,
      gender,
      incidentDetails: {
        dateTimeOfIncident,
        dateTimeOfDiscovery,
        handoverDeadline: moment(dateTimeOfDiscovery).add(2, 'days').format('YYYY-MM-DDTHH:mm'),
        locationId,
      },
      incidentStatement,
      offenceDetails,
      incidentRole,
      status,
      statusReason: '',
      statusDetails: '',
      isYouthOffender,
      createdDateTime: '2022-12-09T10:30:00',
      createdByUserId: 'USER1',
      bookingId: 1,
      reviewedByUserId: 'USER2',
      damages,
      evidence,
      witnesses,
      hearings,
      dateTimeOfFirstHearing,
      issuingOfficer,
      dateTimeOfIssue,
      ...otherData,
    }
  }

  draftAdjudication = ({
    id,
    prisonerNumber,
    gender = PrisonerGender.MALE,
    locationId = 1,
    dateTimeOfIncident = '2023-01-01T06:00:00',
    dateTimeOfDiscovery = dateTimeOfIncident,
    offenceDetails = {} as OffenceDetails,
    incidentRole = {} as IncidentRole,
    damages = [],
    evidence = [],
    witnesses = [],
    adjudicationNumber = null,
    incidentStatement = {} as IncidentStatement,
    isYouthOffender = false,
    startedByUserId = 'USER1',
  }: {
    id: number
    prisonerNumber: string
    gender?: PrisonerGender
    locationId?: number
    dateTimeOfIncident?: string
    dateTimeOfDiscovery?: string
    offenceDetails?: OffenceDetails
    incidentRole?: IncidentRole
    damages?: DamageDetails[]
    evidence?: EvidenceDetails[]
    witnesses?: WitnessDetails[]
    adjudicationNumber?: number
    incidentStatement?: IncidentStatement
    isYouthOffender?: boolean
    startedByUserId?: string
  }): DraftAdjudication => {
    return {
      id,
      prisonerNumber,
      adjudicationNumber,
      gender,
      incidentDetails: {
        locationId,
        dateTimeOfIncident,
        dateTimeOfDiscovery,
        handoverDeadline: moment(dateTimeOfDiscovery).add(2, 'days').format('YYYY-MM-DDTHH:mm'),
      },
      incidentStatement,
      incidentRole,
      offenceDetails,
      startedByUserId,
      damages,
      evidence,
      witnesses,
      isYouthOffender,
    }
  }

  residentialLocations = (): Location[] => {
    return [
      {
        locationId: 25538,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
      {
        locationId: 25655,
        agencyId: 'MDI',
        locationPrefix: 'MDI-2',
        userDescription: 'Houseblock 2',
      },
      {
        locationId: 26956,
        agencyId: 'MDI',
        locationPrefix: 'MDI-RECEP',
        userDescription: 'Reception',
      },
      {
        locationId: 27102,
        agencyId: 'MDI',
        locationPrefix: 'MDI-MCASU',
        userDescription: 'Segregation MPU',
      },
    ]
  }

  simplePrisoner = (
    offenderNo: string,
    firstName: string,
    lastName: string,
    assignedLivingUnitDesc: string
  ): PrisonerSimpleResult => {
    return {
      offenderNo,
      firstName,
      lastName,
      assignedLivingUnitDesc,
    }
  }

  singleHearing = (dateTimeOfHearing: string): HearingDetails => {
    return {
      id: 86,
      locationId: 775,
      dateTimeOfHearing,
      oicHearingType: OicHearingType.GOV_ADULT,
    }
  }

  alerts = (codes: string[]): AlertFlags[] => {
    return alertFlagLabels.filter(alert => codes.includes(alert.alertCodes[0]))
  }

  userFromUsername = (username = 'USER1') => {
    return {
      activeCaseLoadId: 'MDI',
      name: 'Test User',
      username,
      token: 'token-1',
      authSource: 'auth',
    }
  }

  emailFromUsername = (username = 'USER1') => {
    return {
      username,
      email: 'test@justice.gov.uk',
      verified: true,
    }
  }

  prisonerSearchSummary = ({
    firstName,
    lastName,
    prisonerNumber,
    enhanced = true,
    gender = 'Male',
    startHref = null,
  }: {
    firstName: string
    lastName: string
    prisonerNumber: string
    enhanced?: boolean
    gender?: string
    startHref?: string
  }): PrisonerSearchSummary => {
    return {
      cellLocation: '1-2-015',
      prisonerNumber,
      prisonName: 'HMP Moorland',
      gender,
      prisonId: 'MDI',
      firstName,
      lastName,
      startHref: enhanced ? startHref : null,
      displayCellLocation: enhanced ? '1-2-015' : null,
      displayName: enhanced ? `${lastName}, ${firstName}` : null,
      friendlyName: enhanced ? `${firstName} ${lastName}` : null,
    }
  }

  prisonerResultSummary = ({
    offenderNo,
    firstName,
    lastName,
    gender = 'Male',
    includeBirthday = true,
    language = 'English',
    assignedLivingUnitDesc = '1-2-015',
  }: {
    offenderNo: string
    firstName: string
    lastName: string
    gender?: string
    includeBirthday?: boolean
    language?: string
    assignedLivingUnitDesc?: string
  }): PrisonerResultSummary => {
    return {
      offenderNo,
      firstName,
      lastName,
      language,
      displayName: `${lastName}, ${firstName}`,
      friendlyName: `${firstName} ${lastName}`,
      prisonerNumber: offenderNo,
      categoryCode: 'A',
      currentLocation: assignedLivingUnitDesc,
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 123,
        description: assignedLivingUnitDesc,
        agencyName: 'Moorland (HMPYOI)',
      },
      dateOfBirth: includeBirthday ? '1990-10-11' : null,
      physicalAttributes: {
        gender,
      },
    }
  }
}
