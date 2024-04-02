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
import { DisIssue, OicHearingType, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import PrisonerSimpleResult from '../../data/prisonerSimpleResult'
import { Location } from '../../data/PrisonLocationResult'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import { alertFlagLabels, AlertFlags } from '../../utils/alertHelper'
import {
  HearingDetails,
  HearingOutcomeCode,
  HearingOutcomeResult,
  NotProceedReason,
  Outcome,
  OutcomeCode,
  OutcomeHistory,
  QuashGuiltyFindingReason,
  ReferGovReason,
  ReferralOutcome,
  ReferralOutcomeCode,
} from '../../data/HearingAndOutcomeResult'
import {
  PrivilegeType,
  PunishmentComment,
  PunishmentDataWithSchedule,
  PunishmentReasonForChange,
  PunishmentSchedule,
  PunishmentType,
} from '../../data/PunishmentResult'
import { ChartDetailsResult, ChartLastUpdatedResult } from '../../services/ChartDetailsResult'
import { OffenderMovementInfo } from '../../data/prisonApiClient'

export default class TestData {
  reportedAdjudication = ({
    chargeNumber,
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
    outcomes = null,
    punishments = null,
    punishmentComments = [],
    dateTimeOfFirstHearing = null,
    issuingOfficer = null,
    dateTimeOfIssue = null,
    createdByUserId = 'USER1',
    originatingAgencyId = 'MDI',
    overrideAgencyId = 'LEI',
    createdOnBehalfOfOfficer = null,
    createdOnBehalfOfReason = null,
    otherData,
    disIssueHistory = [],
    canActionFromHistory = false,
  }: {
    chargeNumber?: string
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
    outcomes?: OutcomeHistory
    punishments?: PunishmentDataWithSchedule[]
    punishmentComments?: PunishmentComment[]
    dateTimeOfFirstHearing?: string
    issuingOfficer?: string
    dateTimeOfIssue?: string
    createdByUserId?: string
    originatingAgencyId?: string
    overrideAgencyId?: string
    createdOnBehalfOfOfficer?: string
    createdOnBehalfOfReason?: string
    otherData?: any
    disIssueHistory?: DisIssue[]
    canActionFromHistory?: boolean
  }) => {
    return {
      chargeNumber,
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
      reviewedByUserId: 'USER2',
      damages,
      evidence,
      witnesses,
      hearings,
      outcomes,
      punishments,
      punishmentComments,
      dateTimeOfFirstHearing,
      issuingOfficer,
      dateTimeOfIssue,
      originatingAgencyId,
      overrideAgencyId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      ...otherData,
      disIssueHistory,
      canActionFromHistory,
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
    chargeNumber = null,
    incidentStatement = {} as IncidentStatement,
    isYouthOffender = false,
    startedByUserId = 'USER1',
    originatingAgencyId = 'MDI',
    createdOnBehalfOfOfficer = null,
    createdOnBehalfOfReason = null,
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
    chargeNumber?: string
    incidentStatement?: IncidentStatement
    isYouthOffender?: boolean
    startedByUserId?: string
    originatingAgencyId?: string
    createdOnBehalfOfOfficer?: string
    createdOnBehalfOfReason?: string
    otherData?: any
  }) => {
    return {
      id,
      prisonerNumber,
      chargeNumber,
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
      originatingAgencyId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
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
    agencyId = 'MDI',
  }: {
    dateTimeOfHearing: string
    outcome?: HearingOutcomeResult
    id?: number
    locationId?: number
    oicHearingType?: OicHearingType
    agencyId?: string
  }): HearingDetails => {
    return {
      id,
      locationId,
      dateTimeOfHearing,
      oicHearingType,
      agencyId,
      outcome: outcome && outcome,
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

  outcome = ({
    id = 1,
    code = OutcomeCode.REFER_POLICE,
    details = 'Some details',
    referGovReason,
    reason,
    quashedReason,
  }: {
    id?: number
    code?: OutcomeCode
    details?: string
    referGovReason?: ReferGovReason
    reason?: NotProceedReason
    quashedReason?: QuashGuiltyFindingReason
  }): Outcome => {
    return {
      id,
      code,
      details,
      reason,
      quashedReason,
      referGovReason,
    }
  }

  referralOutcome = ({
    id = 1,
    code = ReferralOutcomeCode.PROSECUTION,
    details = null,
    reason = null,
    referGovReason = null,
  }: {
    id?: number
    code?: ReferralOutcomeCode
    details?: string
    reason?: NotProceedReason
    referGovReason?: ReferGovReason
  }): ReferralOutcome => {
    return {
      id,
      code,
      details,
      reason,
      referGovReason,
    }
  }

  punishmentWithSchedule = ({
    id = 1,
    redisId = 'redisId',
    type = PunishmentType.PRIVILEGE,
    privilegeType = PrivilegeType.CANTEEN,
    otherPrivilege = 'lalalala',
    stoppagePercentage = 0,
    schedule = {
      days: 10,
      startDate: '2023-04-03',
      endDate: '2023-04-12',
      suspendedUntil: '2023-04-03',
    },
    activatedFrom = '0',
  }: {
    redisId?: string
    id?: number
    type?: PunishmentType
    privilegeType?: PrivilegeType
    otherPrivilege?: string
    stoppagePercentage?: number
    schedule?: PunishmentSchedule
    activatedFrom?: string
  }): PunishmentDataWithSchedule => {
    return {
      id,
      redisId,
      type,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      schedule,
      activatedFrom,
    }
  }

  singlePunishmentComment = ({
    id = 1,
    comment = 'punishment comment text',
    createdByUserId = 'user1',
    dateTime = '2023-01-01T06:00:00',
    reasonForChange,
  }: {
    id?: number
    comment?: string
    createdByUserId?: string
    dateTime?: string
    reasonForChange?: PunishmentReasonForChange
  }): PunishmentComment => {
    return {
      id,
      comment,
      createdByUserId,
      dateTime,
      reasonForChange,
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

  userFromUsername = (username = 'USER1', name = 'Test User', activeCaseLoadId = 'MDI') => {
    return {
      activeCaseLoadId,
      name,
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

  staffFromName = (
    activeCaseLoadId = 'MDI',
    username = 'JSMITH_GEN',
    name = 'John Smith',
    firstName = 'John',
    lastName = 'Smith'
  ) => {
    return {
      username,
      staffId: 485592,
      email: 'john.smith@digital.justice.gov.uk',
      verified: true,
      firstName,
      lastName,
      name,
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
    prisonId = 'MDI',
  }: {
    firstName: string
    lastName: string
    prisonerNumber: string
    enhanced?: boolean
    gender?: string
    startHref?: string
    prisonId?: string
  }): PrisonerSearchSummary => {
    return {
      cellLocation: '1-2-015',
      prisonerNumber,
      prisonName: 'HMP Moorland',
      gender,
      prisonId,
      firstName,
      lastName,
      startHref: enhanced ? startHref : null,
      displayCellLocation: enhanced ? '1-2-015' : null,
      displayName: enhanced ? `${lastName}, ${firstName}` : null,
      friendlyName: enhanced ? `${firstName} ${lastName}` : null,
      onlyShowPrisonName: false,
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
    agencyId = 'MDI',
  }: {
    offenderNo: string
    firstName: string
    lastName: string
    gender?: string
    includeBirthday?: boolean
    language?: string
    assignedLivingUnitDesc?: string
    agencyId?: string
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
      bookingId: 123,
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
      agencyId,
      sentenceDetail: {
        nonParoleDate: '2029-12-09',
      },
    }
  }

  chartDetailsResult = (value: ChartDetailsResult) => value

  chartLastUpdatedResult = (value: ChartLastUpdatedResult) => value

  confirmDISResponse = ({
    chargeNumber,
    prisonerNumber,
    dateTimeOfDiscovery,
    dateTimeOfIncident = dateTimeOfDiscovery,
    issuingOfficer,
    disIssueHistory = [],
    dateTimeOfFirstHearing = '2024-03-25T11:00:00',
    dateTimeOfIssue,
  }: {
    chargeNumber: string
    prisonerNumber: string
    dateTimeOfIncident?: string
    dateTimeOfDiscovery: string
    issuingOfficer?: string
    dateTimeOfIssue?: string
    disIssueHistory?: DisIssue[]
    dateTimeOfFirstHearing?: string
  }) => {
    return {
      chargeNumber,
      prisonerNumber,
      dateTimeOfIncident,
      dateTimeOfDiscovery,
      issuingOfficer,
      dateTimeOfIssue,
      disIssueHistory,
      dateTimeOfFirstHearing,
    }
  }

  prisonerMovement = ({
    offenderNo = 'A1234AA',
    fromAgency = 'MDI',
    fromAgencyDescription = 'Moorland (HMP & YOI)',
    toAgency = 'LEI',
    toAgencyDescription = 'Leeds (HMP)',
    single = true,
  }: {
    offenderNo?: string
    fromAgency?: string
    fromAgencyDescription?: string
    toAgency?: string
    toAgencyDescription?: string
    single?: boolean
  }): OffenderMovementInfo[] => {
    const movementData = {
      offenderNo,
      createDateTime: '2030-11-19T15:48:40.579962663',
      fromAgency,
      fromAgencyDescription,
      toAgency,
      toAgencyDescription,
      fromCity: '',
      toCity: '',
      movementType: 'ADM',
      movementTypeDescription: 'Admission',
      directionCode: 'IN',
      movementDate: '2030-11-19',
      movementTime: '15:35:17',
      movementReason: 'Transfer In from Other Establishment',
      commentText: 'Prisoner was transferred to Leeds',
    }
    if (!single) {
      return [movementData, movementData]
    }
    return [movementData]
  }
}
