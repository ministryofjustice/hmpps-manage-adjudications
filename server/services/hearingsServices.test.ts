import HearingsService from './hearingsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { HearingOutcomePlea } from '../data/HearingAndOutcomeResult'
import TestData from '../routes/testutils/testData'

const testData = new TestData()

jest.mock('../data/manageAdjudicationsUserTokensClient')
jest.mock('../data/manageAdjudicationsSystemTokensClient')
jest.mock('../data/hmppsAuthClient')
const createChargeProvedHearingOutcome = jest.fn()

jest.mock('../data/manageAdjudicationsUserTokensClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createChargeProvedHearingOutcome,
    }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const token = 'some token'
const user = testData.userFromUsername('user1')

describe('hearingsService', () => {
  let service: HearingsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new HearingsService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should convert amount to null', () => {
    service.createChargedProvedHearingOutcome('1', 'test', HearingOutcomePlea.GUILTY, user)

    expect(createChargeProvedHearingOutcome).toBeCalledWith('1', {
      plea: HearingOutcomePlea.GUILTY,
      adjudicator: 'test',
    })
  })
  it('should convert amount to number', () => {
    service.createChargedProvedHearingOutcome('1', 'test', HearingOutcomePlea.GUILTY, user)

    expect(createChargeProvedHearingOutcome).toBeCalledWith('1', {
      plea: HearingOutcomePlea.GUILTY,
      adjudicator: 'test',
    })
  })
})
