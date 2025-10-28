import LocationService from './locationService'
import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TestData from '../routes/testutils/testData'

const getLocations = jest.fn()
const getAdjudicationLocations = jest.fn()
const testData = new TestData()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/locationsInsidePrisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getLocations, getAdjudicationLocations }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'

describe('locationService', () => {
  let service: LocationService

  const user = testData.userFromUsername('user1')

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
      expect(getLocations).toHaveBeenCalledWith('WRI')
    })
    it('should assign internalLocationCode as userDescription when userDescription value is absent', async () => {
      getLocations.mockReturnValue([
        {
          id: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          localName: 'Place 1',
          key: 'MDI-1',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          localName: 'Other cell',
          key: 'MDI-2',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          localName: "Prisoner's cell",
          key: 'MDI-3',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          localName: undefined,
          key: 'MDI-4',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          localName: 'Place 5',
          key: 'MDI-5',
          prisonId: 'MDI',
        },
      ])

      const result = await service.getIncidentLocations('MDI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'MDI-3',
          userDescription: "Prisoner's cell",
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'MDI-2',
          userDescription: 'Other cell',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'MDI-4',
          userDescription: 'MDI-4',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'MDI-1',
          userDescription: 'Place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          locationPrefix: 'MDI-5',
          userDescription: 'Place 5',
        },
      ])
    })
    it('should sort retrieved locations with top 2 primary locations at the begining', async () => {
      getLocations.mockReturnValue([
        {
          id: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          localName: 'place 2',
          key: 'MDI-place-2',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-6',
          locationUuid: 'location-uuid-6',
          localName: 'Other cell',
          key: 'MDI-some-cell',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          localName: 'place 3',
          key: 'MDI-cell-3',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          localName: "Prisoner's cell",
          key: 'MDI-cell-5',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          localName: 'place 1',
          key: 'MDI-place-1',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          localName: 'place 4',
          key: 'MDI-place-4',
          prisonId: 'MDI',
        },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          locationPrefix: 'MDI-cell-5',
          userDescription: "Prisoner's cell",
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-6',
          locationUuid: 'location-uuid-6',
          locationPrefix: 'MDI-some-cell',
          userDescription: 'Other cell',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'MDI-place-1',
          userDescription: 'place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'MDI-place-2',
          userDescription: 'place 2',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'MDI-cell-3',
          userDescription: 'place 3',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'MDI-place-4',
          userDescription: 'place 4',
        },
      ])
    })
    it('should sort retrieved locations with only 1 primary location at the begining', async () => {
      getLocations.mockReturnValue([
        {
          id: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          localName: 'place 2',
          key: 'MDI-place-2',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          localName: 'place 3',
          key: 'MDI-cell-3',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          localName: "Prisoner's cell",
          key: 'MDI-cell-5',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          localName: 'place 1',
          key: 'MDI-place-1',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          localName: 'place 4',
          key: 'MDI-place-4',
          prisonId: 'MDI',
        },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          locationPrefix: 'MDI-cell-5',
          userDescription: "Prisoner's cell",
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'MDI-place-1',
          userDescription: 'place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'MDI-place-2',
          userDescription: 'place 2',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'MDI-cell-3',
          userDescription: 'place 3',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'MDI-place-4',
          userDescription: 'place 4',
        },
      ])
    })

    it('should sort retrieved locations with zero primary locations at the begining', async () => {
      getLocations.mockReturnValue([
        {
          id: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          localName: 'place 1',
          key: 'MDI-place-1',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          localName: 'place 2',
          key: 'MDI-place-2',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          localName: 'place 3',
          key: 'MDI-cell-3',
          prisonId: 'MDI',
        },
        {
          id: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          localName: 'place 4',
          key: 'MDI-place-4',
          prisonId: 'MDI',
        },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'MDI-place-1',
          userDescription: 'place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'MDI-place-2',
          userDescription: 'place 2',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'MDI-cell-3',
          userDescription: 'place 3',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'MDI-place-4',
          userDescription: 'place 4',
        },
      ])
    })
    it('should sort retrieved locations with zero other locations', async () => {
      getLocations.mockReturnValue([
        { id: 'location-uuid-6', locationUuid: 'location-uuid-6', localName: 'Other cell' },
        { id: 'location-uuid-5', locationUuid: 'location-uuid-5', localName: "Prisoner's cell" },
      ])

      const result = await service.getIncidentLocations('WRI', user)

      expect(result).toEqual([
        {
          agencyId: undefined,
          locationId: 'location-uuid-5',
          locationUuid: 'location-uuid-5',
          locationPrefix: undefined,
          userDescription: "Prisoner's cell",
        },
        {
          agencyId: undefined,
          locationId: 'location-uuid-6',
          locationUuid: 'location-uuid-6',
          locationPrefix: undefined,
          userDescription: 'Other cell',
        },
      ])
    })

    it('should use token', async () => {
      await service.getIncidentLocations('WRI', user)

      expect(LocationsInsidePrisonApiClient).toHaveBeenCalledWith(token)
    })
  })
  describe('getHearingLocations', () => {
    it('should retrieve locations', async () => {
      getAdjudicationLocations.mockReturnValue([])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([])
      expect(getAdjudicationLocations).toHaveBeenCalledWith('MDI')
    })
    it('should assign internalLocationCode as userDescription when userDescription value is absent', async () => {
      getAdjudicationLocations.mockReturnValue([
        { id: 'location-uuid-2', key: 'ab', localName: undefined, prisonId: 'MDI' },
        { id: 'location-uuid-3', key: 'cd', localName: 'place 3', prisonId: 'MDI' },
        { id: 'location-uuid-1', key: 'ef', localName: 'place 1', prisonId: 'MDI' },
        { id: 'location-uuid-4', key: 'gh', localName: undefined, prisonId: 'MDI' },
      ])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'ab',
          userDescription: 'ab',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'gh',
          userDescription: 'gh',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'ef',
          userDescription: 'place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'cd',
          userDescription: 'place 3',
        },
      ])
    })
    it('should sort retrieved locations alphabetically by userDescription', async () => {
      getAdjudicationLocations.mockReturnValue([
        { id: 'location-uuid-2', key: 'ab', localName: 'place-2', prisonId: 'MDI' },
        { id: 'location-uuid-3', key: 'cd', localName: 'place 3', prisonId: 'MDI' },
        { id: 'location-uuid-1', key: 'ef', localName: 'place 1', prisonId: 'MDI' },
        { id: 'location-uuid-4', key: 'gh', localName: 'place-4', prisonId: 'MDI' },
      ])

      const result = await service.getHearingLocations('MDI', user)

      expect(result).toEqual([
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-1',
          locationUuid: 'location-uuid-1',
          locationPrefix: 'ef',
          userDescription: 'place 1',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-2',
          locationUuid: 'location-uuid-2',
          locationPrefix: 'ab',
          userDescription: 'place-2',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-3',
          locationUuid: 'location-uuid-3',
          locationPrefix: 'cd',
          userDescription: 'place 3',
        },
        {
          agencyId: 'MDI',
          locationId: 'location-uuid-4',
          locationUuid: 'location-uuid-4',
          locationPrefix: 'gh',
          userDescription: 'place-4',
        },
      ])
    })
    it('should use token', async () => {
      await service.getIncidentLocations('WRI', user)

      expect(LocationsInsidePrisonApiClient).toHaveBeenCalledWith(token)
    })
  })
})
