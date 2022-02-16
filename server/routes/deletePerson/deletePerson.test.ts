import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, userService },
    { redirectUrl: '/incident-details/G6123VU/466/edit' }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: undefined,
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  userService.getStaffFromUsername.mockResolvedValue({
    username: 'NTEST_GEN',
    name: 'NAOMI TEST',
    authSource: 'nomis',
    activeCaseLoadId: 'MDI',
    token: 'token',
    email: 'naomi.test@digital.justice.gov.uk',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /delete-person', () => {
  it('should load the delete person page and render the correct name - prn', () => {
    return request(app)
      .get('/delete-person?associatedPersonId=G6415GD')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you want to delete Udfsanaye Aidetria?')
      })
  })
  it('should load the delete person page and render the correct name - user id', () => {
    return request(app)
      .get('/delete-person?associatedPersonId=NTEST_GEN')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you want to delete Naomi Test?')
      })
  })
})

describe('POST /delete-person', () => {
  it('should redirect to the redirectUrl provided on the session with deleted person query if yes option selected', () => {
    return request(app)
      .post('/delete-person?associatedPersonId=G6415GD')
      .send({
        deletePerson: 'yes',
      })
      .expect(302)
      .expect('Location', '/incident-details/G6123VU/466/edit?personDeleted=true')
  })
  it('should redirect to the redirectUrl provided on the session with selected person query if no option selected', () => {
    return request(app)
      .post('/delete-person?associatedPersonId=G6415GD')
      .send({
        deletePerson: 'no',
      })
      .expect(302)
      .expect('Location', '/incident-details/G6123VU/466/edit?selectedPerson=G6415GD')
  })
  it('should render an error summary if no radio is selected', () => {
    return request(app)
      .post('/delete-person?associatedPersonId=G6415GD')
      .send({})
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select yes if you want to delete this person.')
      })
  })
})
