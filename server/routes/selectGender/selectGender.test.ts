import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-gender', () => {
  beforeEach(() => {
    placeOnReportService.getPrisonerDetails.mockResolvedValueOnce({
      offenderNo: 'A7937DY',
      firstName: 'UDFSANAYE',
      lastName: 'AIDETRIA',
      physicalAttributes: { gender: 'Unknown' },
      dateOfBirth: undefined,
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
      prisonerNumber: 'A7937DY',
      currentLocation: 'Moorland (HMP & YOI)',
    })
  })
  it('should load the select gender page', () => {
    return request(app)
      .get(adjudicationUrls.selectGender.url.start('A7937DY'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the gender of the prisoner?')
        expect(res.text).toContain(
          'This is the gender the prisoner identifies as. We’re asking this because there’s no gender specified on this prisoner’s profile.'
        )
      })
  })
})

describe('GET /select-gender when gender is already set on profile', () => {
  beforeEach(() => {
    placeOnReportService.getPrisonerDetails.mockResolvedValueOnce({
      offenderNo: 'F7234VO',
      firstName: 'UDFSANAYE',
      lastName: 'AIDETRIA',
      physicalAttributes: { gender: 'Male' },
      dateOfBirth: undefined,
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
      prisonerNumber: 'F7234VO',
      currentLocation: 'Moorland (HMP & YOI)',
    })
  })
  it('should redirect to the homepage if the prisoner already has a gender set on their profile', () => {
    return request(app)
      .get(adjudicationUrls.selectGender.url.start('F7234VO'))
      .expect(302)
      .expect('Location', adjudicationUrls.homepage.root)
  })
})

describe('POST /select-gender', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.start('A7937DY'))
      .send({ genderSelected: 'MALE' })
      .expect('Location', adjudicationUrls.incidentDetails.urls.start('A7937DY'))
      .expect(() => {
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledTimes(0)
        expect(placeOnReportService.setPrisonerGenderOnSession).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.setPrisonerGenderOnSession).toHaveBeenCalledWith(
          expect.anything(),
          'A7937DY',
          'MALE'
        )
      })
  })
  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.start('A7937DY'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select the prisoner’s gender')
      })
  })
})
