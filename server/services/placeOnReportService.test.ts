import PlaceOnReportService from './placeOnReportService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'

const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()
const postDraftIncidentStatement = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { postDraftIncidentStatement }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'

describe('placeOnReportService', () => {
  let service: PlaceOnReportService

  const user = {
    activeCaseLoadId: 'MDI',
    name: 'User',
    username: 'user1',
    token: 'token-1',
    authSource: 'auth',
  }

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PlaceOnReportService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getPrisonerImage', () => {
    it('uses prison api to request image data', async () => {
      getPrisonerImage.mockResolvedValue('image data')

      const result = await service.getPrisonerImage('A1234AA', user)

      expect(result).toEqual('image data')
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerImage).toBeCalledWith('A1234AA')
    })
  })

  describe('getPrisonerDetails', () => {
    it('returns correctly formatted prisoner details', async () => {
      getPrisonerDetails.mockResolvedValue({
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
      })

      const result = await service.getPrisonerDetails('A1234AA', user)

      expect(result).toEqual({
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
        displayName: 'Smith, John',
        firstName: 'JOHN',
        friendlyName: 'John Smith',
        lastName: 'SMITH',
        offenderNo: 'A1234AA',
        prisonerNumber: 'A1234AA',
      })
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerDetails).toBeCalledWith('A1234AA')
    })
  })

  describe('postDraftIncidentStatement', () => {
    beforeEach(() => {
      postDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
    })
    it('makes the api call and returns data', async () => {
      const response = await service.postDraftIncidentStatement(4, 'This is a statement', user)

      expect(postDraftIncidentStatement).toBeCalledWith(4, { statement: 'This is a statement' })
      expect(response).toStrictEqual({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
    })
  })
})
