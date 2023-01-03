import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    })
  )
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 436,
      prisonerNumber: 'G6415GD',
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      incidentStatement: {
        statement: 'This is the statement about the event',
        completed: true,
      },
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-statement', () => {
  it('should load the incident statement page', () => {
    return request(app)
      .get(adjudicationUrls.incidentStatement.urls.submittedEdit(1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident statement')
      })
  })
})

describe('POST /incident-statement', () => {
  it('should redirect to check your answers page (edit version for after submission)', () => {
    return request(app)
      .post(adjudicationUrls.incidentStatement.urls.submittedEdit(1))
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.report(1))
      .expect(_ => {
        expect(placeOnReportService.addOrUpdateDraftIncidentStatement).toHaveBeenLastCalledWith(
          1,
          'Lorem Ipsum',
          true,
          expect.anything()
        )
      })
  })

  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.incidentStatement.urls.submittedEdit(1))
      .send({ incidentStatement: '', incidentStatementComplete: 'yes' })
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Write the full details of the alleged offence')
      })
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.addOrUpdateDraftIncidentStatement.mockRejectedValue(new Error('error message content'))
    return request(app)
      .post(adjudicationUrls.incidentStatement.urls.submittedEdit(1))
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
