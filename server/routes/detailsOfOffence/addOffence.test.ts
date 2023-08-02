import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 101,
      chargeNumber: '1524493',
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
    }),
  })

  app = appWithAllRoutes({ production: false }, { placeOnReportService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence/100/add view', () => {
  it('should load the offence details page', () => {
    return request(app)
      .get(`${adjudicationUrls.detailsOfOffence.urls.add(100)}?offenceCode=1`)
      .expect(302)
      .expect('Location', `${adjudicationUrls.detailsOfOffence.urls.modified(100)}?offenceCode=1`)
  })
})
