import PrisonerSearchService, { PrisonerSearchSummary } from './prisonerSearchService'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { makeNotFoundError } from '../test/helpers'

const search = jest.fn()
const searchPrisonerDetails = jest.fn()
const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonerSearchClient', () => {
  return jest.fn().mockImplementation(() => {
    return { search, getPrisonerDetails: searchPrisonerDetails }
  })
})

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'
const prisonIds = ['PR1', 'PR2']
const user = {
  username: 'user1',
  name: 'User',
  activeCaseLoadId: 'MDI',
  token: 'token-1',
} as User

describe('prisonerSearchService', () => {
  let service: PrisonerSearchService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PrisonerSearchService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('search by prisoner identifier', async () => {
      search.mockResolvedValue([
        {
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonName: 'HMP Moorland',
          prisonerNumber: 'A1234AA',
          cellLocation: '1-2-015',
        },
        {
          firstName: 'STEVE',
          lastName: 'JONES',
          prisonName: 'HMP Moorland',
          prisonerNumber: 'A1234AB',
          cellLocation: '1-2-016',
        },
      ])
      const results = await service.search({ searchTerm: 'a1234aA', prisonIds }, user)
      expect(results).toStrictEqual([
        {
          cellLocation: '1-2-016',
          displayCellLocation: '1-2-016',
          displayName: 'Jones, Steve',
          friendlyName: 'Steve Jones',
          firstName: 'STEVE',
          lastName: 'JONES',
          prisonName: 'HMP Moorland',
          prisonerNumber: 'A1234AB',
        },
        {
          cellLocation: '1-2-015',
          displayCellLocation: '1-2-015',
          displayName: 'Smith, John',
          friendlyName: 'John Smith',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
        } as PrisonerSearchSummary,
      ])
      expect(PrisonerSearchClient).toBeCalledWith(token)
      expect(search).toBeCalledWith({ prisonerIdentifier: 'A1234AA', prisonIds })
    })

    it('search by prisoner name', async () => {
      search.mockResolvedValue([
        {
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonName: 'HMP Moorland',
          prisonerNumber: 'A1234AA',
          cellLocation: '1-2-015',
        },
      ])
      const results = await service.search({ searchTerm: 'Smith, John', prisonIds }, user)
      expect(results).toStrictEqual([
        {
          cellLocation: '1-2-015',
          displayCellLocation: '1-2-015',
          displayName: 'Smith, John',
          friendlyName: 'John Smith',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
        } as PrisonerSearchSummary,
      ])
      expect(PrisonerSearchClient).toBeCalledWith(token)
      expect(search).toBeCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner surname only', async () => {
      await service.search({ searchTerm: 'Smith', prisonIds }, user)
      expect(search).toBeCalledWith({ lastName: 'Smith', prisonIds })
    })

    it('search by prisoner name separated by a space', async () => {
      await service.search({ searchTerm: 'Smith John', prisonIds }, user)
      expect(search).toBeCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner name separated by many spaces', async () => {
      await service.search({ searchTerm: '    Smith   John ', prisonIds }, user)
      expect(search).toBeCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner identifier with extra spaces', async () => {
      await service.search({ searchTerm: '    A1234AA ', prisonIds }, user)
      expect(search).toBeCalledWith({ prisonerIdentifier: 'A1234AA', prisonIds })
    })
  })

  describe('isValidPrisonerNumber', () => {
    it('returns true if prisoner returned', async () => {
      searchPrisonerDetails.mockResolvedValue({
        prisonerNumber: 'A1234AA',
      })

      const result = await service.isPrisonerNumberValid('A1234AA', user)

      expect(result).toEqual(true)
      expect(PrisonerSearchClient).toBeCalledWith(token)
      expect(searchPrisonerDetails).toBeCalledWith('A1234AA')
    })

    it('returns false if nothing returned', async () => {
      searchPrisonerDetails.mockResolvedValue({})

      const result = await service.isPrisonerNumberValid('A1234AA', user)

      expect(result).toEqual(false)
    })

    it('returns false if 404', async () => {
      searchPrisonerDetails.mockRejectedValue(makeNotFoundError())

      const result = await service.isPrisonerNumberValid('A1234AA', user)

      expect(result).toEqual(false)
    })

    it('throws error if not 404 error', async () => {
      searchPrisonerDetails.mockRejectedValue(new Error('Found but still error'))

      await expect(service.isPrisonerNumberValid('A1234AA', user)).rejects.toEqual(new Error('Found but still error'))
    })
  })

  describe('getPrisonerImage', () => {
    it('uses prison api to request image data', async () => {
      getPrisonerImage.mockResolvedValue('image data')

      const result = await service.getPrisonerImage('A1234AA', {
        activeCaseLoadId: 'MDI',
        name: 'User',
        username: 'user1',
        token: 'token-1',
        authSource: 'auth',
      })

      expect(result).toEqual('image data')
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerImage).toBeCalledWith('A1234AA')
    })
  })
})
