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
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue({
    offenderNo: 'A7937DY',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    dateOfBirth: '1990-11-11',
    physicalAttributes: undefined,
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
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 4490,
      prisonerNumber: 'G6123VU',
      gender: 'MALE',
      incidentDetails: undefined,
      offenceDetails: [],
      startedByUserId: undefined,
      damages: [],
      evidence: [],
      witnesses: [],
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-gender edit', () => {
  it('should load the edit select gender page', () => {
    return request(app)
      .get(adjudicationUrls.selectGender.url.edit('A7937DY', 4490))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the gender of the prisoner?')
        expect(res.text).toContain(
          'This is the gender the prisoner identifies as. We’re asking this because there’s no gender specified on this prisoner’s profile.'
        )
      })
  })
})

describe('POST /select-gender edit', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.edit('A7937DY', 4490))
      .send({ genderSelected: 'FEMALE' })
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(4490))
      .expect(() => {
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledWith(4490, 'FEMALE', expect.anything())
        expect(placeOnReportService.setPrisonerGenderOnSession).toHaveBeenCalledTimes(0)
      })
  })
  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.edit('A7937DY', 4490))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select the prisoner’s gender')
      })
  })
})
