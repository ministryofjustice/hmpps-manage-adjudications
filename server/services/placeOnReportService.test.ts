import PlaceOnReportService from './placeOnReportService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'

const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()
const postDraftIncidentStatement = jest.fn()
const startNewDraftAdjudication = jest.fn()
const getDraftAdjudication = jest.fn()
const submitCompleteDraftAdjudication = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      postDraftIncidentStatement,
      startNewDraftAdjudication,
      getDraftAdjudication,
      submitCompleteDraftAdjudication,
    }
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

  describe('getCheckYourAnswersInfo', () => {
    it('returns the draft adjudication information', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 10,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26152,
            dateTimeOfIncident: '2021-11-04T07:20:00',
          },
          incidentStatement: {
            id: 9,
            statement:
              "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
          },
          createdByUserId: 'NCLAMP_GEN',
          createdDateTime: '2021-11-04T09:21:21.95935',
        },
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Natalie Clamp',
        username: 'NCLAMP_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })

      const locations = [
        { locationId: 26152, locationPrefix: 'P3', userDescription: 'place 3', description: '' },
        { locationId: 26155, locationPrefix: 'PC', userDescription: "Prisoner's cell", description: '' },
        { locationId: 26151, locationPrefix: 'P1', userDescription: 'place 1', description: '' },
      ]

      const result = await service.getCheckYourAnswersInfo(10, locations, user)
      const expectedResult = {
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'Natalie Clamp',
          },
          {
            label: 'Date',
            value: '4 November 2021',
          },
          {
            label: 'Time',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'place 3',
          },
        ],
        statement: "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
      }
      expect(result).toEqual(expectedResult)
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
  describe('completeDraftAdjudication', () => {
    it('calls api and returns the reported adjudication number', async () => {
      submitCompleteDraftAdjudication.mockResolvedValue({
        adjudicationNumber: 234,
        incidentDetails: {
          createdByUserId: 'string',
          createdDateTime: '2021-11-09T13:55:34.143Z',
          dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
          locationId: 0,
          modifiedByDateTime: '2021-11-09T13:55:34.143Z',
          modifiedByUserId: 'string',
        },
        incidentStatement: {
          completed: false,
          createdByUserId: 'string',
          createdDateTime: '2021-11-09T13:55:34.143Z',
          modifiedByDateTime: '2021-11-09T13:55:34.143Z',
          modifiedByUserId: 'string',
          statement: 'string',
        },
        prisonerNumber: 'G2996UX',
      })
      const response = await service.completeDraftAdjudication(4, user)
      expect(response).toStrictEqual(234)
    })
  })
})
