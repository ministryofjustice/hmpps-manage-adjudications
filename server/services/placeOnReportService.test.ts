import PlaceOnReportService from './placeOnReportService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'

const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()
const postDraftIncidentStatement = jest.fn()
const startNewDraftAdjudication = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { postDraftIncidentStatement, startNewDraftAdjudication }
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

  describe('startNewDraftAdjudication', () => {
    it('returns the adjudication details with new id', async () => {
      startNewDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 1,
          prisonerNumber: 'G2996UX',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
          },
        },
      })

      const result = await service.startNewDraftAdjudication('2021-10-28T15:40:25.884', 3, 'G2996UX', user)
      expect(startNewDraftAdjudication).toBeCalledWith({
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        locationId: 3,
        prisonerNumber: 'G2996UX',
      })
      expect(result).toEqual({
        draftAdjudication: {
          id: 1,
          prisonerNumber: 'G2996UX',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
          },
        },
      })
    })
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
        currentLocation: '1-2-015',
      })
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerDetails).toBeCalledWith('A1234AA')
    })
    it('displays correct location when the prisoner is in CSWAP', async () => {
      getPrisonerDetails.mockResolvedValue({
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: 'CSWAP' },
        categoryCode: 'C',
      })
      const result = await service.getPrisonerDetails('A1234AA', user)
      expect(result.currentLocation).toEqual('No cell allocated')
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
