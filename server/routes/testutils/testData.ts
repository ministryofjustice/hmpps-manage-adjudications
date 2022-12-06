import { PrisonerGender } from '../../data/DraftAdjudicationResult'
import { Location } from '../../data/PrisonLocationResult'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'

export type OtherData = {
  displayName: string
  friendlyName: string
  issuingOfficer: string
  prisonerLocation: string
  formattedDateTimeOfDiscovery: string
  dateTimeOfDiscovery: string
  issueDateAndTime: string
}

export default class TestData {
  completedAdjudication = (adjudicationNumber: number, prisonerNumber: string, otherData?: OtherData) => {
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
        dateTimeOfDiscovery: '2022-11-15T11:45:00',
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
        locationId: 722174,
        agencyId: 'MDI',
        locationPrefix: 'MDI-RECV',
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
}
