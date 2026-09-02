import HmppsAuthClient from '../data/hmppsAuthClient'
import {
  PrivilegeType,
  PunishmentReasonForChange,
  PunishmentType,
  RehabilitativeActivity,
} from '../data/PunishmentResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import TestData from '../routes/testutils/testData'
import PunishmentsService from './punishmentsService'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'

const getReportedAdjudication = jest.fn()
const createPunishments = jest.fn()
const createPunishmentComment = jest.fn()
const amendPunishmentComment = jest.fn()
const removePunishmentComment = jest.fn()
const getPrisonerDetails = jest.fn()
const getSuspendedPunishments = jest.fn()
const getPossibleConsecutivePunishments = jest.fn()
const getUserFromUsername = jest.fn()

jest.mock('../data/manageAdjudicationsUserTokensClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createPunishments,
      createPunishmentComment,
      amendPunishmentComment,
      removePunishmentComment,
      getSuspendedPunishments,
      getPossibleConsecutivePunishments,
    }
  })
})
jest.mock('../data/manageAdjudicationsSystemTokensClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getReportedAdjudication,
    }
  })
})
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getPrisonerDetails,
    }
  })
})
jest.mock('../data/hmppsAuthClient')
jest.mock('../data/hmppsManageUsersClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getUserFromUsername,
    }
  })
})
const testData = new TestData()
const user = testData.userFromUsername('user1') as User
const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const hmppsManageUsersClient = new HmppsManageUsersClient() as jest.Mocked<HmppsManageUsersClient>
const token = 'some token'

describe('PunishmentsService', () => {
  let service: PunishmentsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PunishmentsService(hmppsAuthClient, hmppsManageUsersClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPunishmentSet', () => {
    it('returns adjudication when punishments sent as array', async () => {
      const punishments = [
        {
          type: PunishmentType.ADDITIONAL_DAYS,
          privilegeType: PrivilegeType.CANTEEN,
          otherPrivilege: 'lalalala',
          stoppagePercentage: 0,
          duration: 0,
          startDate: '2023-04-03',
          endDate: '2023-04-03',
          suspendedUntil: '2023-04-03',
          rehabilitativeActivities: [] as RehabilitativeActivity[],
        },
      ]
      createPunishments.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments,
          },
        }),
      )
      const result = await service.createPunishmentSet(punishments, '100', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments,
          },
        }),
      )
    })
    it('returns adjudication when punishments sent as singular object', async () => {
      const punishments = {
        type: PunishmentType.ADDITIONAL_DAYS,
        privilegeType: PrivilegeType.CANTEEN,
        otherPrivilege: 'lalalala',
        stoppagePercentage: 0,
        duration: 0,
        startDate: '2023-04-03',
        endDate: '2023-04-03',
        suspendedUntil: '2023-04-03',
        rehabilitativeActivities: [] as RehabilitativeActivity[],
      }
      createPunishments.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments: [punishments],
          },
        }),
      )
      const result = await service.createPunishmentSet([punishments], '100', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments: [punishments],
          },
        }),
      )
    })
  })
  describe('getSuspendedPunishmentDetails', () => {
    it('returns expected object', async () => {
      const punishments = [
        {
          chargeNumber: 1525601,
          punishment: {
            id: 73,
            type: 'PRIVILEGE',
            privilegeType: 'CANTEEN',
            schedule: { duration: 10, suspendedUntil: '2023-05-31' },
          },
        },
        {
          chargeNumber: 1525601,
          punishment: { duration: 2, suspendedUntil: '2023-05-31' },
        },
      ]
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments,
          },
        }),
      })
      getPrisonerDetails.mockResolvedValue(
        testData.prisonerResultSummary({
          offenderNo: 'G6123VU',
          firstName: 'John',
          lastName: 'Smith',
        }),
      )
      getSuspendedPunishments.mockResolvedValue(punishments)
      const result = await service.getSuspendedPunishmentDetails('100', user)
      expect(result).toEqual({
        prisonerName: 'John Smith',
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        suspendedPunishments: punishments,
      })
    })
  })
  describe('createPunishmentComment', () => {
    it('returns adjudication when punishments comment sent', async () => {
      const punishmentComments = [
        {
          id: 50,
          comment: 'punishment comment text',
          createdByUsrId: 'userId',
          dateTime: '2023-04-03',
        },
      ]
      createPunishmentComment.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        }),
      )
      const result = await service.createPunishmentComment('100', 'punishment comment text', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        }),
      )
    })
  })
  describe('editPunishmentComment', () => {
    it('returns adjudication when edited punishments comment sent', async () => {
      const punishmentComments = [
        {
          id: 50,
          comment: 'new punishment comment text',
          createdByUsrId: 'userId',
          dateTime: '2023-04-03',
        },
      ]
      amendPunishmentComment.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        }),
      )
      const result = await service.editPunishmentComment('100', 50, 'new punishment comment text', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        }),
      )
    })
  })
  describe('deletePunishmentComment', () => {
    it('returns adjudication when punishments comment was deleted', async () => {
      removePunishmentComment.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {},
        }),
      )
      const result = await service.removePunishmentComment('100', 50, user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          otherData: {},
        }),
      )
    })
  })
  describe('getPunishmentAvailability', () => {
    it('returns adult availability when there are no hearings present on the adjudication', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
        }),
      })
      const result = await service.getPunishmentAvailability('100', user)
      expect(result).toEqual({ isIndependentAdjudicatorHearing: false, isAdult: true })
    })
    it('returns false if the last hearing on the adjudication is a governor hearing', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              oicHearingType: OicHearingType.GOV_ADULT,
              id: 69,
            }),
          ],
        }),
      })
      const result = await service.getPunishmentAvailability('100', user)
      expect(result).toEqual({ isIndependentAdjudicatorHearing: false, isAdult: true })
    })
    it('returns true if the last hearing on the adjudication is an independent adjudicator hearing', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              oicHearingType: OicHearingType.INAD_ADULT,
              id: 69,
            }),
          ],
        }),
      })
      const result = await service.getPunishmentAvailability('100', user)
      expect(result).toEqual({ isIndependentAdjudicatorHearing: true, isAdult: true })
    })
    it('does not make social visits punishments available for a YOI adjudication', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          isYouthOffender: true,
        }),
      })
      const result = await service.getPunishmentAvailability('100', user)
      expect(result).toEqual({ isIndependentAdjudicatorHearing: false, isAdult: false })
    })
  })
  describe('formatPunishmentComments', () => {
    it('returns expected result with reasonForChange', async () => {
      getUserFromUsername.mockResolvedValue(testData.userFromUsername())
      const reportedAdjudication = testData.reportedAdjudication({
        chargeNumber: '100',
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        punishmentComments: [
          testData.singlePunishmentComment({ createdByUserId: 'USER1' }),
          testData.singlePunishmentComment({
            id: 2,
            createdByUserId: 'USER1',
            reasonForChange: PunishmentReasonForChange.CORRECTION,
            comment: 'it was wrong before',
          }),
        ],
      })
      const result = await service.formatPunishmentComments(reportedAdjudication, '100', user)
      expect(result).toEqual([
        {
          changeLink: '/punishment-comment/100/edit/1',
          comment: 'punishment comment text',
          date: '1 January 2023',
          id: 1,
          isOwner: false,
          name: 'T. User',
          removeLink: '/punishment-comment/100/delete/1',
          time: '06:00',
        },
        {
          changeLink: '/punishment-comment/100/edit/2',
          comment: 'it was wrong before',
          date: '1 January 2023',
          id: 2,
          isOwner: false,
          name: 'T. User',
          reasonForChange: 'CORRECTION',
          removeLink: '/punishment-comment/100/delete/2',
          time: '06:00',
        },
      ])
    })
  })

  describe('getPossibleConsecutivePunishments', () => {
    it('filters out entries that are already consecutive to the requested charge (would create a loop)', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({ chargeNumber: '100', prisonerNumber: 'G6123VU' }),
      })
      getPossibleConsecutivePunishments.mockResolvedValue([
        {
          chargeNumber: '101',
          chargeProvedDate: '2023-07-18',
          punishment: {
            id: 1,
            type: PunishmentType.ADDITIONAL_DAYS,
            rehabilitativeActivities: [] as RehabilitativeActivity[],
            schedule: { duration: 5 },
          },
        },
        {
          chargeNumber: '102',
          chargeProvedDate: '2023-07-19',
          punishment: {
            id: 2,
            type: PunishmentType.ADDITIONAL_DAYS,
            rehabilitativeActivities: [] as RehabilitativeActivity[],
            schedule: { duration: 3 },
            consecutiveChargeNumber: '100',
          },
        },
      ])
      const result = await service.getPossibleConsecutivePunishments('100', PunishmentType.ADDITIONAL_DAYS, user)
      expect(result).toHaveLength(1)
      expect(result[0].chargeNumber).toBe('101')
    })
  })
})
