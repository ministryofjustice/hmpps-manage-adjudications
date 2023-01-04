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
import PrisonerSimpleResult from '../../data/prisonerSimpleResult'
import { Location } from '../../data/PrisonLocationResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import { PrisonerResultSummary } from '../../services/placeOnReportService'
import { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import { alertFlagLabels, AlertFlags } from '../../utils/alertHelper'

export default class TestData {
  completedAdjudication = (
    adjudicationNumber: number,
    prisonerNumber: string,
    otherData?: any,
    dateTimeOfDiscovery = '2022-11-15T11:45:00'
  ) => {
    return {
      adjudicationNumber,
      prisonerNumber,
      gender: PrisonerGender.MALE,
      bookingId: 2,
      createdDateTime: '2021-11-15T11:45:00',
      createdByUserId: 'TEST_ER',
      incidentDetails: {
        locationId: 3,
        dateTimeOfIncident: '2021-11-15T11:45:00',
        dateTimeOfDiscovery,
        handoverDeadline: '2021-11-17T11:45:00',
      },
      incidentStatement: {
        statement: 'My incident statement is this',
      },
      incidentRole: {},
      offenceDetails: [{ offenceCode: 1001 }],
      status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      isYouthOffender: false,
      ...otherData,
    }
  }

  draftAdjudication = ({
    id,
    prisonerNumber,
    gender = PrisonerGender.MALE,
    locationId = 1,
    dateTimeOfIncident = '2023-01-01T06:00:00',
    dateTimeOfDiscovery = '2023-01-01T06:00:00',
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
