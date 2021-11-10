import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
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
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-statement', () => {
  it('should load the incident statement page', () => {
    return request(app)
      .get('/incident-statement/G6415GD/1')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident statement')
      })
  })
})

describe('POST /incident-statement', () => {
  it('should redirect to check your answers page if statement is complete', () => {
    return request(app)
      .post('/incident-statement/G6415GD/1')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Location', '/check-your-answers/G6415GD/1')
      .expect(_ => {
        expect(placeOnReportService.postDraftIncidentStatement).toHaveBeenLastCalledWith(
          1,
          'Lorem Ipsum',
          true,
          expect.anything()
        )
      })
  })

  it('should redirect to the task page if the statement is incomplete', () => {
    return request(app)
      .post('/incident-statement/G6415GD/1')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'no' })
      .expect('Location', '/place-a-prisoner-on-report')
  })

  it('should render error summary with correct validation message', () => {
    return request(app)
      .post('/incident-statement/G6415GD/1')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select yes if you have completed your statement')
      })
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.postDraftIncidentStatement.mockRejectedValue(new Error('error message content'))
    return request(app)
      .post('/incident-statement/G6415GD/1')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
