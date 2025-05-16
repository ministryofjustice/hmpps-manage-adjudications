import nock from 'nock'
import moment from 'moment'
import config from '../config'
import { ReportedAdjudicationStatus } from './ReportedAdjudicationResult'
import TestData from '../routes/testutils/testData'
import ManageAdjudicationsUserTokensClient from './manageAdjudicationsUserTokensClient'
import { ActiveCaseLoad } from '../@types/template'

jest.mock('../../logger')
const testData = new TestData()

describe('manageAdjudicationsSystemTokensClient', () => {
  let fakeManageAdjudicationsApi: nock.Scope
  let client: ManageAdjudicationsUserTokensClient

  const token = 'token-1'
  const user = {
    token,
    username: '',
    name: '',
    activeCaseLoadId: '',
    authSource: '',
    meta: {
      caseLoadId: '',
    } as ActiveCaseLoad,
  }

  beforeEach(() => {
    fakeManageAdjudicationsApi = nock(config.apis.adjudications.url)
    client = new ManageAdjudicationsUserTokensClient(user)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllCompletedAdjudications', () => {
    const content = [
      testData.reportedAdjudication({
        chargeNumber: '2',
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        prisonerNumber: 'G6123VU',
      }),
      testData.reportedAdjudication({
        chargeNumber: '1',
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        prisonerNumber: 'G6174VU',
      }),
    ]
    const request = {
      size: 20,
      number: 0,
    }
    const response = {
      size: 20,
      pageNumber: 0,
      totalElements: 2,
      content,
    }

    it('should return a page of completed adjudications', async () => {
      fakeManageAdjudicationsApi
        .get(
          `/reported-adjudications/reports?page=0&size=20&startDate=2021-01-01&endDate=2021-01-01&status=AWAITING_REVIEW`
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.meta.caseLoadId)
        .reply(200, response)

      const result = await client.getAllCompletedAdjudications(
        {
          fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
          toDate: moment('01/01/2021', 'DD/MM/YYYY'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        request
      )
      expect(result).toEqual(response)
    })
  })
})
