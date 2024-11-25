import nock from 'nock'
import config from '../config'
import PrisonApiClient from './prisonApiClient'

jest.mock('../../logger')

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let client: PrisonApiClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prison.url)
    client = new PrisonApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getUserCaseLoads', () => {
    it('return the users case loads', async () => {
      const caseLoads = [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: true,
        },
        {
          caseLoadId: 'LEI',
          description: 'Leeds',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: false,
        },
      ]
      fakePrisonApi.get('/api/users/me/caseLoads').matchHeader('authorization', `Bearer ${token}`).reply(200, caseLoads)
      const response = await client.getUserCaseLoads()

      expect(response).toEqual(caseLoads)
    })
  })

  describe('getPrisonerImage', () => {
    it('should return image data from api', async () => {
      fakePrisonApi
        .get(`/api/bookings/offenderNo/A1234AA/image/data`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, 'image data', { 'Content-Type': 'image/jpeg' })

      const response = await client.getPrisonerImage('A1234AA')

      expect(response.read()).toEqual(Buffer.from('image data'))
    })
  })

  describe('getPrisonerDetails', () => {
    it('should return only the neccessary prisoner details', async () => {
      const result = {
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
        language: 'English',
        imprisonmentStatus: 'UNKNOWN',
        dateOfBirth: '2005-01-01',
      }
      fakePrisonApi.get('/api/offenders/A1234AA').matchHeader('authorization', `Bearer ${token}`).reply(200, result)

      const response = await client.getPrisonerDetails('A1234AA')

      expect(response).toEqual({
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: {
          description: '1-2-015',
        },
        categoryCode: 'C',
        dateOfBirth: '2005-01-01',
        language: 'English',
      })
    })
  })

  describe('getSecondaryLanguages', () => {
    it('should return data from api', async () => {
      const result = [
        {
          code: 'SPA',
          description: 'Spanish',
          canRead: true,
          canWrite: false,
          canSpeak: true,
        },
        {
          code: 'GER',
          description: 'German',
          canRead: true,
          canWrite: false,
          canSpeak: false,
        },
      ]

      fakePrisonApi
        .get('/api/bookings/123/secondary-languages')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const output = await client.getSecondaryLanguages(123)
      expect(output).toEqual(result)
    })
  })
})
