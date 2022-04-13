import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 101,
      adjudicationNumber: 1524493,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentRole: {
        roleCode: undefined,
      },
      startedByUserId: 'TEST_GEN',
    },
  })

  const allOffencesSessionService = new AllOffencesSessionService()
  app = appWithAllRoutes({ production: false }, { placeOnReportService, allOffencesSessionService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence/100/add view', () => {
  it('should load the offence details page', () => {
    return request(app)
      .get(`${adjudicationUrls.detailsOfOffence.urls.add(100)}?offenceCode=1`)
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(100))
  })
})
