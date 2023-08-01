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
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, userService },
    { redirectUrl: adjudicationUrls.incidentDetails.urls.edit('G6123VU', 466) }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    })
  )

  userService.getStaffFromUsername.mockResolvedValue(testData.staffFromUsername())
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /delete-person', () => {
  it('should load the delete person page and render the correct name - prn', () => {
    return request(app)
      .get(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you want to delete Udfsanaye Aidetria?')
      })
  })
  it('should load the delete person page and render the correct name - user id', () => {
    return request(app)
      .get(`${adjudicationUrls.deletePerson.root}?associatedPersonId=NTEST_GEN`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you want to delete Test User?')
      })
  })
})

describe('POST /delete-person', () => {
  it('should redirect to the redirectUrl provided on the session with deleted person query if yes option selected', () => {
    return request(app)
      .post(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
      .send({
        deletePerson: 'yes',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.incidentDetails.urls.edit('G6123VU', 466)}?personDeleted=true`)
  })
  it('should redirect to the redirectUrl provided on the session with selected person query if no option selected', () => {
    return request(app)
      .post(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
      .send({
        deletePerson: 'no',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.incidentDetails.urls.edit('G6123VU', 466)}?selectedPerson=G6415GD`)
  })
  it('should render an error summary if no radio is selected', () => {
    return request(app)
      .post(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
      .send({})
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select yes if you want to delete this person')
      })
  })
})
