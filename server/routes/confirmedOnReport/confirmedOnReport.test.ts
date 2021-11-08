import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService() as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
})

reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFirstName: 'John',
  prisonerLastName: 'Smith',
  prisonerPreferredNonEnglishLanguage: 'French',
  prisonerOtherLanguages: ['English', 'Spanish'],
  prisonerNeurodiversities: ['Moderate learning difficulty', 'Dyslexia'],
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-placed-on-report', () => {
  it('should load the confirmation of placed on report page', () => {
    return request(app)
      .get('/prisoner-placed-on-report?adjudicationNumber=123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('John Smith has been placed on report')
        expect(res.text).toContain('123')
      })
  })

  it('should throw an error if no adjudication number provided', () => {
    return request(app)
      .get('/prisoner-placed-on-report')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: No adjudication number provided')
      })
  })

  it('should throw an error if an invalid adjudication number provided', () => {
    return request(app)
      .get('/prisoner-placed-on-report?adjudicationNumber=BadNumber')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: No adjudication number provided')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get('/prisoner-placed-on-report?adjudicationNumber=123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
