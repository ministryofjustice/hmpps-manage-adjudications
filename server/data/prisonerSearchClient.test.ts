import nock from 'nock'
import config from '../config'
import PrisonSearchClient from './prisonerSearchClient'

describe('prisonerSearchClient', () => {
  let fakePrisonerSearchApi: nock.Scope
  let client: PrisonSearchClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonerSearchApi = nock(config.apis.prisonerSearch.url)
    client = new PrisonSearchClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('search', () => {
    it('search by prisoner identifier', async () => {
      const results: unknown[] = []
      fakePrisonerSearchApi
        .post(
          `/prisoner-search/match-prisoners`,
          '{"includeAliases":false,"prisonerIdentifier":"A1234AA","prisonIds":["PR1","PR2"]}'
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await client.search({ prisonerIdentifier: 'A1234AA', prisonIds: ['PR1', 'PR2'] })

      expect(output).toEqual(results)
    })

    it('search by prisoner name', async () => {
      const results: unknown[] = []
      fakePrisonerSearchApi
        .post(
          `/prisoner-search/match-prisoners`,
          '{"includeAliases":false,"firstName":"John","lastName":"Smith","prisonIds":["PR1","PR2"]}'
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await client.search({ firstName: 'John', lastName: 'Smith', prisonIds: ['PR1', 'PR2'] })

      expect(output).toEqual(results)
    })

    it('search including aliases', async () => {
      const results: unknown[] = []
      fakePrisonerSearchApi
        .post(`/prisoner-search/match-prisoners`, '{"includeAliases":true,"prisonerIdentifier":"A1234AA"}')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await client.search({ includeAliases: true, prisonerIdentifier: 'A1234AA' })

      expect(output).toEqual(results)
    })
  })

  describe('response', () => {
    it('parses response correctly', async () => {
      const response = [
        {
          something: 'to ignore',
          prisonerNumber: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
          prisonId: 'LEI',
          prisonName: 'HMP Leeds',
          cellLocation: 'LEI-1-2',
        },
      ]

      fakePrisonerSearchApi
        .post(`/prisoner-search/match-prisoners`, '{"includeAliases":false,"prisonerIdentifier":"A1234AA"}')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const output = await client.search({ prisonerIdentifier: 'A1234AA' })

      expect(output).toEqual([
        {
          prisonerNumber: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
          prisonId: 'LEI',
          prisonName: 'HMP Leeds',
          cellLocation: 'LEI-1-2',
        },
      ])
    })
  })

  describe('get prisoner details', () => {
    it('returns for prisoner', async () => {
      const results = {
        prisonerNumber: 'A1234AA'
      }
      fakePrisonerSearchApi
        .get(
          `/prisoner/A1234AA`
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await client.getPrisonerDetails('A1234AA')

      expect(output).toEqual({
        prisonerNumber: 'A1234AA',
      })
    })
  })
})
