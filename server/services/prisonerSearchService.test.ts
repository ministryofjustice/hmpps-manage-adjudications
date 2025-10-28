import PrisonerSearchService from './prisonerSearchService'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { makeSearchApiNotFoundError } from '../test/helpers'
import TestData from '../routes/testutils/testData'
import adjudicationUrls from '../utils/urlGenerator'
import { User } from '../data/hmppsManageUsersClient'

const search = jest.fn()
const searchPrisonerDetails = jest.fn()
const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()

const testData = new TestData()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/hmppsManageUsersClient')
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
  meta: {
    caseLoadId: 'MDI',
    description: 'Moorland',
  },
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
        testData.prisonerSearchSummary({
          firstName: 'Steve',
          lastName: 'Jones',
          prisonerNumber: 'A1234AB',
          gender: 'Unknown',
          enhanced: false,
        }),
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
        }),
      ])
      const results = await service.search({ searchTerm: 'a1234aA', prisonIds }, user)
      expect(results).toStrictEqual([
        testData.prisonerSearchSummary({
          firstName: 'Steve',
          lastName: 'Jones',
          prisonerNumber: 'A1234AB',
          gender: 'Unknown',
          startHref: adjudicationUrls.selectGender.url.start('A1234AB'),
        }),
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          startHref: adjudicationUrls.incidentDetails.urls.start('A1234AA'),
        }),
      ])
      expect(PrisonerSearchClient).toHaveBeenCalledWith(token)
      expect(search).toHaveBeenCalledWith({ prisonerIdentifier: 'A1234AA', prisonIds })
    })

    it('search by prisoner name', async () => {
      search.mockResolvedValue([
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
        }),
      ])
      const results = await service.search({ searchTerm: 'Smith, John', prisonIds }, user)
      expect(results).toStrictEqual([
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          startHref: adjudicationUrls.incidentDetails.urls.start('A1234AA'),
        }),
      ])
      expect(PrisonerSearchClient).toHaveBeenCalledWith(token)
      expect(search).toHaveBeenCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner surname only', async () => {
      await service.search({ searchTerm: 'Smith', prisonIds }, user)
      expect(search).toHaveBeenCalledWith({ lastName: 'Smith', prisonIds })
    })

    it('search by prisoner name separated by a space', async () => {
      await service.search({ searchTerm: 'Smith John', prisonIds }, user)
      expect(search).toHaveBeenCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner name separated by many spaces', async () => {
      await service.search({ searchTerm: '    Smith   John ', prisonIds }, user)
      expect(search).toHaveBeenCalledWith({ lastName: 'Smith', firstName: 'John', prisonIds })
    })

    it('search by prisoner identifier with extra spaces', async () => {
      await service.search({ searchTerm: '    A1234AA ', prisonIds }, user)
      expect(search).toHaveBeenCalledWith({ prisonerIdentifier: 'A1234AA', prisonIds })
    })
  })

  describe('isValidPrisonerNumber', () => {
    it('returns true if prisoner returned', async () => {
      searchPrisonerDetails.mockResolvedValue({
        prisonerNumber: 'A1234AA',
      })

      const result = await service.isPrisonerNumberValid('A1234AA', user)

      expect(result).toEqual(true)
      expect(PrisonerSearchClient).toHaveBeenCalledWith(token)
      expect(searchPrisonerDetails).toHaveBeenCalledWith('A1234AA')
    })

    it('returns false if nothing returned', async () => {
      searchPrisonerDetails.mockResolvedValue({})

      const result = await service.isPrisonerNumberValid('A1234AA', user)

      expect(result).toEqual(false)
    })

    it('returns false if 404', async () => {
      searchPrisonerDetails.mockRejectedValue(makeSearchApiNotFoundError())

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

      const result = await service.getPrisonerImage('A1234AA', testData.userFromUsername('user1'))

      expect(result).toEqual('image data')
      expect(PrisonApiClient).toHaveBeenCalledWith(token)
      expect(getPrisonerImage).toHaveBeenCalledWith('A1234AA')
    })
  })
})
