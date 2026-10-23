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
  describe('getLastHearingDate', () => {
    it('returns the date of the last hearing', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          hearings: [
            testData.singleHearing({ dateTimeOfHearing: '2026-08-10T10:00:00', id: 1 }),
            testData.singleHearing({ dateTimeOfHearing: '2026-08-17T14:30:00', id: 2 }),
          ],
        }),
      })
      expect(await service.getLastHearingDate('100', user)).toEqual('2026-08-17')
    })

    it('returns null when there is no hearing', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({ chargeNumber: '100', prisonerNumber: 'G6123VU' }),
      })
      expect(await service.getLastHearingDate('100', user)).toBeNull()
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

describe('PunishmentsService session batches', () => {
  const service = new PunishmentsService(null, null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newRequest = (session: Record<string, unknown> = {}): any => ({ session })

  const canteen = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN }
  const library = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'library' }

  describe('punishment batch', () => {
    it('falls back to the award punishments page when there is no batch', () => {
      expect(service.nextPunishmentBatchUrl(newRequest(), '100')).toEqual('/award-punishments/100/modified')
      expect(service.nextUnansweredBatchItemIndex(newRequest(), '100')).toEqual(-1)
    })

    it('moves through the unanswered items then to the schedule', () => {
      const req = newRequest()
      service.startPunishmentBatch(req, '100', [canteen, library])
      expect(service.nextPunishmentBatchUrl(req, '100')).toEqual('/punishment-duration/100')
      expect(service.nextUnansweredBatchItemIndex(req, '100')).toEqual(0)

      service.markBatchItemAnswered(req, '100', 0, 'a')
      expect(service.nextUnansweredBatchItemIndex(req, '100')).toEqual(1)
      expect(service.isInPunishmentBatch(req, '100', 'a')).toBe(true)

      service.markBatchItemAnswered(req, '100', 1, 'b')
      expect(service.nextUnansweredBatchItemIndex(req, '100')).toEqual(-1)
      expect(service.nextPunishmentBatchUrl(req, '100')).toEqual('/punishment-schedule/100')
    })

    it('replaces an earlier batch and keeps charges apart', () => {
      const req = newRequest()
      service.startPunishmentBatch(req, '100', [canteen])
      service.markBatchItemAnswered(req, '100', 0, 'a')
      service.startPunishmentBatch(req, '200', [library])
      service.startPunishmentBatch(req, '100', [library])

      expect(service.getPunishmentBatch(req, '100')).toEqual({
        items: [{ ...library, batchItemId: expect.any(String) }],
      })
      expect(service.getPunishmentBatch(req, '200')).toEqual({
        items: [{ ...library, batchItemId: expect.any(String) }],
      })
    })

    it('gives every item an id of its own, new for each batch', () => {
      const req = newRequest()
      service.startPunishmentBatch(req, '100', [canteen, library])
      const firstIds = service.getPunishmentBatch(req, '100').items.map(item => item.batchItemId)
      service.startPunishmentBatch(req, '100', [canteen, library])
      const secondIds = service.getPunishmentBatch(req, '100').items.map(item => item.batchItemId)

      expect(new Set([...firstIds, ...secondIds]).size).toEqual(4)
    })

    it('records whether one answer applies to all items', () => {
      const req = newRequest()
      service.startPunishmentBatch(req, '100', [canteen, library])
      service.setPunishmentBatchSameForAll(req, '100', true)
      expect(service.getPunishmentBatch(req, '100').sameForAll).toBe(true)
    })

    it('is cleared when the session punishments are deleted', () => {
      const req = newRequest({ punishments: { 100: [] } })
      service.startPunishmentBatch(req, '100', [canteen])
      service.startRehabBatch(req, '100', ['a'])
      service.setSuccessMessage(req, '100', 'Loss of canteen added')

      service.deleteAllSessionPunishments(req, '100')

      expect(service.getPunishmentBatch(req, '100')).toBeUndefined()
      expect(service.getRehabBatch(req, '100')).toBeUndefined()
      expect(service.takeSuccessMessage(req, '100')).toBeUndefined()
    })
  })

  describe('rehab batch', () => {
    const suspended = (redisId: string, rehabilitativeActivities: RehabilitativeActivity[] = []) => ({
      ...canteen,
      redisId,
      duration: 10,
      suspendedUntil: '2026-11-30',
      rehabilitativeActivities,
    })

    it('falls back to the award punishments page when there is no batch', () => {
      expect(service.nextRehabBatchUrl(newRequest(), '100')).toEqual('/award-punishments/100/modified')
    })

    it('asks about each punishment in turn then shows the schedule', () => {
      const req = newRequest()
      service.startRehabBatch(req, '100', ['a', 'b'])
      expect(service.nextRehabBatchUrl(req, '100')).toEqual('/punishment-has-rehabilitative-activities-details/100/a')

      service.completeRehabBatchItem(req, '100', 'a')
      expect(service.nextRehabBatchUrl(req, '100')).toEqual('/punishment-has-rehabilitative-activities-details/100/b')

      service.completeRehabBatchItem(req, '100', 'b')
      expect(service.nextRehabBatchUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')
    })

    it('ignores a punishment that is not in the batch', () => {
      const req = newRequest()
      service.startRehabBatch(req, '100', ['a'])
      service.completeRehabBatchItem(req, '100', 'z')
      expect(service.getRehabBatch(req, '100').completedRedisIds).toEqual([])
    })

    it('copies the activities to every punishment when one answer applies to all', () => {
      const activity = { sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01', id: 9 }
      const req = newRequest({ punishments: { 100: [suspended('a', [activity]), suspended('b')] } })
      service.startRehabBatch(req, '100', ['a', 'b'])
      service.setRehabBatchSameForAll(req, '100', true)

      service.completeRehabBatchItem(req, '100', 'a')

      expect(service.nextRehabBatchUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')
      expect(service.getSessionPunishment(req, '100', 'b').rehabilitativeActivities).toEqual([
        { ...activity, id: undefined },
      ])
    })
  })

  describe('updating a session punishment', () => {
    it('keeps it in its place in the list', () => {
      const req = newRequest({
        punishments: {
          100: [
            { ...canteen, redisId: 'a', duration: 5, rehabilitativeActivities: [] },
            { ...library, redisId: 'b', duration: 5, rehabilitativeActivities: [] },
          ],
        },
      })
      service.updateSessionPunishment(req, { ...canteen, duration: 9, rehabilitativeActivities: [] }, '100', 'a')
      expect(service.getAllSessionPunishments(req, '100').map((p: { redisId: string }) => p.redisId)).toEqual([
        'a',
        'b',
      ])
      expect(service.getSessionPunishment(req, '100', 'a').duration).toEqual(9)
    })

    it('keeps an edited activity in its place', () => {
      const activities = [
        { sessionId: 1, details: 'first' },
        { sessionId: 2, details: 'second' },
      ]
      const req = newRequest({
        punishments: { 100: [{ ...library, redisId: 'b', rehabilitativeActivities: activities }] },
      })
      service.editRehabilitativeActivity(req, '100', 'b', 1, { sessionId: 1, details: 'changed' })
      expect(
        service
          .getSessionPunishment(req, '100', 'b')
          .rehabilitativeActivities.map((a: { details: string }) => a.details),
      ).toEqual(['changed', 'second'])
    })
  })

  describe('removing a rehabilitative activity condition', () => {
    it('clears the activities and unlocks the punishment for changes', () => {
      const req = newRequest({
        punishments: {
          100: [
            {
              ...library,
              redisId: 'b',
              isThereRehabilitativeActivities: true,
              hasRehabilitativeActivitiesDetails: true,
              rehabilitativeActivities: [{ sessionId: 1, details: 'Course' }],
            },
          ],
        },
      })
      service.noRehabilitativeActivities(req, '100', 'b')
      expect(service.getSessionPunishment(req, '100', 'b')).toEqual(
        expect.objectContaining({
          isThereRehabilitativeActivities: false,
          hasRehabilitativeActivitiesDetails: false,
          rehabilitativeActivities: [],
        }),
      )
    })
  })

  describe('success message', () => {
    it('is returned once only', () => {
      const req = newRequest()
      service.setSuccessMessage(req, '100', '2 punishments added')
      expect(service.takeSuccessMessage(req, '100')).toEqual('2 punishments added')
      expect(service.takeSuccessMessage(req, '100')).toBeUndefined()
    })
  })
})
