import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
})

const reportedAdjudicationInformation = {
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFirstName: 'John',
  prisonerLastName: 'Smith',
  prisonerNumber: 'H5123BY',
  prisonerPreferredNonEnglishLanguage: 'French',
  prisonerOtherLanguages: ['English', 'Spanish'],
  prisonerNeurodiversities: ['Moderate learning difficulty', 'Dyslexia'],
}

reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue(reportedAdjudicationInformation)

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /print-report', () => {
  it('should load the print page', () => {
    return request(app)
      .get('/print-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Print a copy of this report')
        expect(res.text).toContain('123')
        expect(res.text).toContain('John Smith’s preferred language is')
        expect(res.text).toContain('They have other languages of')
        expect(res.text).toContain('They have recorded disabilities')
        expect(res.text).toContain('Moderate learning difficulty')
        expect(res.text).toContain('Dyslexia')
      })
  })

  it('should not show neurodivesity information if none provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerNeurodiversities: null,
    })
    return request(app)
      .get('/print-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('They have recorded disabilities')
      })
  })

  it('should not show any language information if no primary language provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerPreferredNonEnglishLanguage: null,
    })
    return request(app)
      .get('/print-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('John Smith’s preferred language is')
        expect(res.text).not.toContain('They have other languages of')
      })
  })

  it('should not show the secondary language text if no secondary languages provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerOtherLanguages: null,
    })
    return request(app)
      .get('/print-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('John Smith’s preferred language is')
        expect(res.text).not.toContain('They have other languages of')
      })
  })

  it('should throw an error if no adjudication number provided', () => {
    return request(app)
      .get('/print-report')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError')
      })
  })

  it('should throw an error if an invalid adjudication number provided', () => {
    return request(app)
      .get('/print-report/BadNumber')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: No adjudication number provided')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get('/print-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
