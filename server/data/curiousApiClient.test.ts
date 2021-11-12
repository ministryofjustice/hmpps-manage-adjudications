import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'

describe('curiousApiClient', () => {
  let fakeCuriousApi: nock.Scope
  let client: CuriousApiClient

  const token = 'token-1'

  beforeEach(() => {
    fakeCuriousApi = nock(config.apis.curious.url)
    client = new CuriousApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getLearnerProfiles', () => {
    it('should return the expected response data', async () => {
      const dummyLearnerProfiles = getDummyLearnerProfiles()
      const prisonerNumber = dummyLearnerProfiles[0].prn
      fakeCuriousApi
        .get(`/learnerProfile/${prisonerNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, dummyLearnerProfiles)

      const actual = await client.getLearnerProfiles(prisonerNumber)
      expect(actual).toEqual(dummyLearnerProfiles)
    })
  })
})

function getDummyLearnerProfiles(): LearnerProfile[] {
  return [
    {
      prn: 'G6123VU',
      establishmentId: 'MDI',
      uln: '1234123412',
      primaryLDDAndHealthProblem: 'Visual impairment',
      additionalLDDAndHealthProblems: [
        'Hearing impairment',
        'Social and emotional difficulties',
        'Mental health difficulty',
      ],
    },
    {
      prn: 'G6123VU',
      establishmentId: 'WDI',
      uln: '9876987654',
      primaryLDDAndHealthProblem: null,
      additionalLDDAndHealthProblems: [],
    },
  ]
}
