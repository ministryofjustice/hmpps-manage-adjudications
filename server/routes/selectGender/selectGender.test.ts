import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-gender', () => {
  beforeEach(() => {
    placeOnReportService.getPrisonerDetails.mockResolvedValueOnce(
      testData.prisonerResultSummary({
        offenderNo: 'A7937DY',
        firstName: 'UDFSANAYE',
        lastName: 'AIDETRIA',
        gender: 'Unknown',
      })
    )
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

describe('POST /select-gender', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.start('A7937DY'))
      .send({ genderSelected: PrisonerGender.MALE })
      .expect('Location', adjudicationUrls.incidentDetails.urls.start('A7937DY'))
      .expect(() => {
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledTimes(0)
        expect(placeOnReportService.setPrisonerGenderOnSession).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.setPrisonerGenderOnSession).toHaveBeenCalledWith(
          expect.anything(),
          'A7937DY',
          PrisonerGender.MALE
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
