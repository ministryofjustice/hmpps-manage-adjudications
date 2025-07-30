import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValueOnce({
    draftAdjudication: testData.draftAdjudication({
      id: 4490,
      prisonerNumber: 'A7937DY',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-gender edit', () => {
  beforeEach(() => {
    placeOnReportService.getPrisonerDetails.mockResolvedValueOnce(
      testData.prisonerResultSummary({
        offenderNo: 'A7937DY',
        firstName: 'UDFSANAYE',
        lastName: 'AIDETRIA',
        gender: 'Unknown',
      }),
    )
  })
  it('should load the edit select gender page', () => {
    return request(app)
      .get(adjudicationUrls.selectGender.url.edit('A7937DY', 4490))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the gender of the prisoner?')
        expect(res.text).toContain(
          'This is the gender the prisoner identifies as. We’re asking this because there’s no gender specified on this prisoner’s profile.',
        )
      })
  })
})

describe('POST /select-gender edit', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.selectGender.url.edit('A7937DY', 4490))
      .send({ genderSelected: PrisonerGender.FEMALE })
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(4490))
      .expect(() => {
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.amendPrisonerGender).toHaveBeenCalledWith(
          4490,
          PrisonerGender.FEMALE,
          expect.anything(),
        )
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
