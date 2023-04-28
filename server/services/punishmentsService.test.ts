import { User } from '../data/hmppsAuthClient'
import { PrivilegeType, PunishmentType } from '../data/PunishmentResult'
import TestData from '../routes/testutils/testData'
import PunishmentsService from './punishmentsService'

const getReportedAdjudication = jest.fn()
const createPunishments = jest.fn()

jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createPunishments,
      getReportedAdjudication,
    }
  })
})
const testData = new TestData()
const user = testData.userFromUsername('user1') as User

describe('PunishmentsService', () => {
  let service: PunishmentsService

  beforeEach(() => {
    service = new PunishmentsService(null)
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
})
