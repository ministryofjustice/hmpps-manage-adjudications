import 'reflect-metadata'
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
        pncNumber: '1/1234AA',
        croNumber: '9/999B',
        mostSeriousOffence: 'Burglary',
        category: 'B',
        nationality: 'British',
        dateOfBirth: '1990-01-02',
        sentenceExpiryDate: '2020-09-20',
        licenceExpiryDate: '2020-09-21',
        paroleEligibilityDate: '2020-09-22',
        homeDetentionCurfewEligibilityDate: '2020-09-23',
        releaseDate: '2020-09-24',
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
        pncNumber: '1/1234AA',
        croNumber: '9/999B',
        mostSeriousOffence: 'Burglary',
        category: 'B',
        nationality: 'British',
        dateOfBirth: new Date(Date.UTC(1990, 0, 2)),
        sentenceExpiryDate: new Date(Date.UTC(2020, 8, 20)),
        licenceExpiryDate: new Date(Date.UTC(2020, 8, 21)),
        paroleEligibilityDate: new Date(Date.UTC(2020, 8, 22)),
        homeDetentionCurfewEligibilityDate: new Date(Date.UTC(2020, 8, 23)),
        releaseDate: new Date(Date.UTC(2020, 8, 24)),
      },
    ])
  })
})
