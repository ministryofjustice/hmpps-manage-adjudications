import LocationService from './locationService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'

const getLocations = jest.fn()
const getAdjudicationLocations = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getLocations, getAdjudicationLocations }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'

describe('locationService', () => {
  let service: LocationService

  const user = {
    activeCaseLoadId: 'MDI',
    name: 'User',
    username: 'user1',
    token: 'token-1',
    authSource: 'auth',
  }

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new LocationService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getIncidentLocations', () => {
    it('should retrieve locations', async () => {
      getLocations.mockReturnValue([])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([])
      expect(getLocations).toBeCalledWith('WRI')
    })
    it('should assign internalLocationCode as userDescription when userDescription value is absent', async () => {
      getLocations.mockReturnValue([
        { id: 2, locationPrefix: 'P2', userDescription: undefined },
        { id: 6, locationPrefix: 'OC', userDescription: 'Other cell' },
        { id: 3, locationPrefix: 'P3', userDescription: 'place 3' },
        { id: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
        { id: 1, locationPrefix: 'P1', userDescription: 'place 1' },
        { id: 4, locationPrefix: 'P4', userDescription: undefined },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        { id: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
        { id: 6, locationPrefix: 'OC', userDescription: 'Other cell' },
        { id: 2, locationPrefix: 'P2', userDescription: 'P2' },
        { id: 4, locationPrefix: 'P4', userDescription: 'P4' },
        { id: 1, locationPrefix: 'P1', userDescription: 'place 1' },
        { id: 3, locationPrefix: 'P3', userDescription: 'place 3' },
      ])
    })
    it('should sort retrieved locations with top 2 primary locations at the begining', async () => {
      getLocations.mockReturnValue([
        { id: 2, userDescription: 'place 2' },
        { id: 6, userDescription: 'Other cell' },
        { id: 3, userDescription: 'place 3' },
        { id: 5, userDescription: "Prisoner's cell" },
        { id: 1, userDescription: 'place 1' },
        { id: 4, userDescription: 'place 4' },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        { id: 5, userDescription: "Prisoner's cell" },
        { id: 6, userDescription: 'Other cell' },
        { id: 1, userDescription: 'place 1' },
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 4, userDescription: 'place 4' },
      ])
    })
    it('should sort retrieved locations with only 1 primary location at the begining', async () => {
      getLocations.mockReturnValue([
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 5, userDescription: "Prisoner's cell" },
        { id: 1, userDescription: 'place 1' },
        { id: 4, userDescription: 'place 4' },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        { id: 5, userDescription: "Prisoner's cell" },
        { id: 1, userDescription: 'place 1' },
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 4, userDescription: 'place 4' },
      ])
    })

    it('should sort retrieved locations with zero primary locations at the begining', async () => {
      getLocations.mockReturnValue([
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 1, userDescription: 'place 1' },
        { id: 4, userDescription: 'place 4' },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        { id: 1, userDescription: 'place 1' },
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 4, userDescription: 'place 4' },
      ])
    })
    it('should sort retrieved locations with zero other locations', async () => {
      getLocations.mockReturnValue([
        { id: 6, userDescription: 'Other cell' },
        { id: 5, userDescription: "Prisoner's cell" },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        { id: 5, userDescription: "Prisoner's cell" },
        { id: 6, userDescription: 'Other cell' },
      ])
    })

    it('should use token', async () => {
      await service.getIncidentLocations('WRI', user)

      expect(PrisonApiClient).toBeCalledWith(token)
    })
  })
  describe('getHearingLocations', () => {
    it('should retrieve locations', async () => {
      getAdjudicationLocations.mockReturnValue([])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([])
      expect(getAdjudicationLocations).toBeCalledWith('MDI')
    })
    it('should assign internalLocationCode as userDescription when userDescription value is absent', async () => {
      getAdjudicationLocations.mockReturnValue([
        { id: 2, locationPrefix: 'ab', userDescription: undefined },
        { id: 3, locationPrefix: 'cd', userDescription: 'place 3' },
        { id: 1, locationPrefix: 'ef', userDescription: 'place 1' },
        { id: 4, locationPrefix: 'gh', userDescription: undefined },
      ])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([
        { id: 2, locationPrefix: 'ab', userDescription: 'ab' },
        { id: 4, locationPrefix: 'gh', userDescription: 'gh' },
        { id: 1, locationPrefix: 'ef', userDescription: 'place 1' },
        { id: 3, locationPrefix: 'cd', userDescription: 'place 3' },
      ])
    })
    it('should sort retrieved locations alphabetically by userDescription', async () => {
      getAdjudicationLocations.mockReturnValue([
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 1, userDescription: 'place 1' },
        { id: 4, userDescription: 'place 4' },
      ])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([
        { id: 1, userDescription: 'place 1' },
        { id: 2, userDescription: 'place 2' },
        { id: 3, userDescription: 'place 3' },
        { id: 4, userDescription: 'place 4' },
      ])
    })
    it('should use token', async () => {
      await service.getIncidentLocations('WRI', user)

      expect(PrisonApiClient).toBeCalledWith(token)
    })
  })
})
