import Question from '../offenceCodeDecisions/Question'
import TestData from '../routes/testutils/testData'
import DecisionTreeService, { AnswerData } from './decisionTreeService'
import PlaceOnReportService, { PrisonerResultSummary } from './placeOnReportService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import UserService from './userService'
import { User } from '../data/hmppsManageUsersClient'

const getPrisonerDetails = jest.fn()
const getStaffFromUsername = jest.fn()

jest.mock('./placeOnReportService', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerDetails }
  })
})
jest.mock('./userService', () => {
  return jest.fn().mockImplementation(() => {
    return { getStaffFromUsername }
  })
})
jest.mock('./reportedAdjudicationsService')
jest.mock('../offenceCodeDecisions/Question')

const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null, null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const question = new Question(null) as jest.Mocked<Question>
const testData = new TestData()

let service: DecisionTreeService

const victimPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'AA1234A',
  firstName: 'Alan',
  lastName: 'Balan',
})

const victimStaffDetails = testData.staffFromUsername('Alan')

beforeEach(() => {
  service = new DecisionTreeService(placeOnReportService, userService, reportedAdjudicationsService, question, [])
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('answerData', () => {
  let answerData: AnswerData
  let callingUser: User

  beforeEach(() => {
    getPrisonerDetails.mockResolvedValue(victimPrisonerDetails)
    getStaffFromUsername.mockResolvedValue(victimStaffDetails)
  })

  describe('offence with no data', () => {
    beforeEach(() => {
      answerData = {}
    })

    it('returns expected data', async () => {
      const result = await service.answerDataDetails(answerData, callingUser)
      const expected = {}

      expect(result).toEqual(expected)
    })

    it('makes expected calls', async () => {
      await service.answerDataDetails(answerData, callingUser)

      expect(getPrisonerDetails).not.toHaveBeenCalled()
      expect(getStaffFromUsername).not.toHaveBeenCalled()
    })
  })

  describe('offence with prisoner victim', () => {
    beforeEach(() => {
      answerData = {
        victimPrisonersNumber: 'AA1234A',
      }
    })

    it('returns expected data', async () => {
      const result = await service.answerDataDetails(answerData, callingUser)
      const expected = {
        victimPrisoner: victimPrisonerDetails,
        victimPrisonerNumber: 'AA1234A',
      }

      expect(result).toEqual(expected)
    })

    it('makes expected calls', async () => {
      await service.answerDataDetails(answerData, callingUser)

      expect(getPrisonerDetails).toHaveBeenCalledWith('AA1234A', undefined)
      expect(getStaffFromUsername).not.toHaveBeenCalled()
    })
  })

  describe('offence with staff victim', () => {
    beforeEach(() => {
      answerData = {
        victimStaffUsername: 'John Smith',
      }
    })

    it('returns expected data', async () => {
      const result = await service.answerDataDetails(answerData, callingUser)
      const expected = {
        victimStaff: victimStaffDetails,
      }

      expect(result).toEqual(expected)
    })

    it('makes expected calls', async () => {
      await service.answerDataDetails(answerData, callingUser)

      expect(getPrisonerDetails).not.toHaveBeenCalled()
      expect(getStaffFromUsername).toHaveBeenCalledWith('John Smith', undefined)
    })
  })

  describe('offence with other person as victim', () => {
    beforeEach(() => {
      answerData = {
        victimOtherPersonsName: 'Tim Smith',
      }
    })

    it('returns expected data', async () => {
      const result = await service.answerDataDetails(answerData, callingUser)
      const expected = {
        victimOtherPerson: 'Tim Smith',
      }

      expect(result).toEqual(expected)
    })

    it('makes expected calls', async () => {
      await service.answerDataDetails(answerData, callingUser)

      expect(getPrisonerDetails).not.toHaveBeenCalled()
      expect(getStaffFromUsername).not.toHaveBeenCalled()
    })
  })

  describe('offence with prisoner from outside the establishment as victim', () => {
    beforeEach(() => {
      answerData = {
        victimOtherPersonsName: 'Jane Smith',
        victimPrisonersNumber: 'AA1235A',
      }
    })

    it('returns expected data', async () => {
      const result = await service.answerDataDetails(answerData, callingUser)
      const expected = {
        victimOtherPerson: 'Jane Smith',
        victimPrisonerNumber: 'AA1235A',
      }

      expect(result).toEqual(expected)
    })

    it('makes expected calls', async () => {
      await service.answerDataDetails(answerData, callingUser)

      expect(getPrisonerDetails).not.toHaveBeenCalled()
      expect(getStaffFromUsername).not.toHaveBeenCalled()
    })
  })
})
