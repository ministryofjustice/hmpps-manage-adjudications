/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'
import {
  DamageCode,
  DamageDetails,
  EvidenceCode,
  EvidenceDetails,
  IncidentRole,
  IncidentStatement,
  OffenceDetails,
  PrisonerGender,
  WitnessCode,
  WitnessDetails,
} from '../../data/DraftAdjudicationResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import PrisonerSimpleResult from '../../data/prisonerSimpleResult'
import { Location } from '../../data/PrisonLocationResult'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import { alertFlagLabels, AlertFlags } from '../../utils/alertHelper'
import {
  HearingDetails,
  HearingOutcomeCode,
  HearingOutcomeResult,
  OutcomeHistory,
} from '../../data/HearingAndOutcomeResult'

export default class TestData {
  reportedAdjudication = ({
    adjudicationNumber,
    prisonerNumber,
    dateTimeOfIncident = '2023-01-01T06:00:00',
    gender = PrisonerGender.MALE,
    dateTimeOfDiscovery = dateTimeOfIncident,
    handoverDeadline,
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
    history = null,
    dateTimeOfFirstHearing = null,
    issuingOfficer = null,
    dateTimeOfIssue = null,
    createdByUserId = 'USER1',
    otherData,
  }: {
    adjudicationNumber: number
    prisonerNumber: string
    dateTimeOfIncident?: string
    gender?: PrisonerGender
    dateTimeOfDiscovery?: string
    handoverDeadline?: string
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
    history?: OutcomeHistory
    dateTimeOfFirstHearing?: string
    issuingOfficer?: string
    dateTimeOfIssue?: string
    createdByUserId?: string
    otherData?: any
  }) => {
    return {
      adjudicationNumber,
      prisonerNumber,
      gender,
      incidentDetails: {
        dateTimeOfIncident,
        dateTimeOfDiscovery,
        handoverDeadline,
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
      createdByUserId,
      bookingId: 1,
      reviewedByUserId: 'USER2',
      damages,
      evidence,
      witnesses,
      hearings,
      history,
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
    otherData = {} as any,
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
    otherData?: any
  }) => {
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
      ...otherData,
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

  singleHearing = ({
    dateTimeOfHearing,
    outcome,
    id = 101,
    locationId = 775,
    oicHearingType = OicHearingType.GOV_ADULT,
  }: {
    dateTimeOfHearing: string
    outcome?: HearingOutcomeResult
    id?: number
    locationId?: number
    oicHearingType?: OicHearingType
  }): HearingDetails => {
    return {
      id,
      locationId,
      dateTimeOfHearing,
      oicHearingType,
      outcome,
    }
  }

  hearingOutcome = ({
    id = 1,
    code = HearingOutcomeCode.REFER_POLICE,
    adjudicator = 'Judge Red',
    optionalItems,
  }: {
    id?: number
    code?: HearingOutcomeCode
    adjudicator?: string
    optionalItems?: any
  }): HearingOutcomeResult => {
    return {
      id,
      code,
      adjudicator,
      ...optionalItems,
    }
  }

  singleDamage = ({
    code = DamageCode.REDECORATION,
    details = 'Some damage details',
    reporter = 'TESTER_GEN',
  }: {
    code?: DamageCode
    details?: string
    reporter?: string
  }): DamageDetails => {
    return {
      code,
      details,
      reporter,
    }
  }

  singleEvidence = ({
    code = EvidenceCode.BAGGED_AND_TAGGED,
    details = 'Some details here',
    reporter = 'user1',
    identifier,
  }: {
    code?: EvidenceCode
    details?: string
    reporter?: string
    identifier?: string
  }): EvidenceDetails => {
    return {
      code,
      details,
      reporter,
      identifier,
    }
  }

  singleWitness = ({
    code = WitnessCode.OFFICER,
    firstName = 'Firstname',
    lastName = 'Lastname',
    reporter = 'user1',
  }: {
    code?: WitnessCode
    firstName?: string
    lastName?: string
    reporter?: string
  }): WitnessDetails => {
    return {
      code,
      firstName,
      lastName,
      reporter,
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

  staffFromUsername = (username = 'USER1') => {
    const data = this.userFromUsername(username)
    return {
      ...data,
      email: 'tester.test@digital.justice.gov.uk',
    }
  }

  staffFromName = (activeCaseLoadId = 'MDI') => {
    return {
      username: 'JSMITH_GEN',
      staffId: 485592,
      email: 'john.smith@digital.justice.gov.uk',
      verified: true,
      firstName: 'John',
      lastName: 'Smith',
      name: 'John Smith',
      activeCaseLoadId,
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
