import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { PrivilegeType, PunishmentType } from '../data/PunishmentResult'
import TestData from '../routes/testutils/testData'
import PunishmentsService from './punishmentsService'

const getReportedAdjudication = jest.fn()
const createPunishments = jest.fn()
const createPunishmentComment = jest.fn()
const amendPunishmentComment = jest.fn()
const removePunishmentComment = jest.fn()
const getPrisonerDetails = jest.fn()
const getSuspendedPunishments = jest.fn()

jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createPunishments,
      createPunishmentComment,
      amendPunishmentComment,
      removePunishmentComment,
      getReportedAdjudication,
      getSuspendedPunishments,
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
const testData = new TestData()
const user = testData.userFromUsername('user1') as User
const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const token = 'some token'

describe('PunishmentsService', () => {
  let service: PunishmentsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PunishmentsService(hmppsAuthClient)
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
          days: 0,
          startDate: '2023-04-03',
          endDate: '2023-04-03',
          suspendedUntil: '2023-04-03',
        },
      ]
      createPunishments.mockResolvedValue(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments,
          },
        })
      )
      const result = await service.createPunishmentSet(punishments, 100, user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments,
          },
        })
      )
    })
    it('returns adjudication when punishments sent as singular object', async () => {
      const punishments = {
        type: PunishmentType.ADDITIONAL_DAYS,
        privilegeType: PrivilegeType.CANTEEN,
        otherPrivilege: 'lalalala',
        stoppagePercentage: 0,
        days: 0,
        startDate: '2023-04-03',
        endDate: '2023-04-03',
        suspendedUntil: '2023-04-03',
      }
      createPunishments.mockResolvedValue(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments: [punishments],
          },
        })
      )
      const result = await service.createPunishmentSet([punishments], 100, user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishments: [punishments],
          },
        })
      )
    })
  })
  describe('getSuspendedPunishmentDetails', () => {
    it('returns expected object', async () => {
      const punishments = [
        {
          reportNumber: 1525601,
          punishment: {
            id: 73,
            type: 'PRIVILEGE',
            privilegeType: 'CANTEEN',
            schedule: { days: 10, suspendedUntil: '2023-05-31' },
          },
        },
        {
          reportNumber: 1525601,
          punishment: { days: 2, suspendedUntil: '2023-05-31' },
        },
      ]
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
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
        })
      )
      getSuspendedPunishments.mockResolvedValue(punishments)
      const result = await service.getSuspendedPunishmentDetails(100, user)
      expect(result).toEqual({
        prisonerName: 'John Smith',
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
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        })
      )
      const result = await service.createPunishmentComment(100, 'punishment comment text', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        })
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
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        })
      )
      const result = await service.editPunishmentComment(100, 50, 'new punishment comment text', user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {
            punishmentComments,
          },
        })
      )
    })
  })
  describe('deletePunishmentComment', () => {
    it('returns adjudication when punishments comment was deleted', async () => {
      removePunishmentComment.mockResolvedValue(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {},
        })
      )
      const result = await service.removePunishmentComment(100, 50, user)
      expect(result).toEqual(
        testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          otherData: {},
        })
      )
    })
  })
})
