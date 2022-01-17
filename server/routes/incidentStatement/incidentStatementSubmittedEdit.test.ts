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
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 436,
      adjudicationNumber: 1524493,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentRole: {},
      incidentStatement: {
        statement: 'This is the statement about the event',
        completed: true,
      },
      startedByUserId: 'TEST2_GEN',
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-statement', () => {
  it('should load the incident statement page', () => {
    return request(app)
      .get('/incident-statement/G6415GD/1/submitted/edit')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident statement')
      })
  })
})

describe('POST /incident-statement', () => {
  it('should redirect to check your answers page (edit version for after submission)', () => {
    return request(app)
      .post('/incident-statement/G6415GD/1/submitted/edit')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Location', '/check-your-answers/G6415GD/1/report')
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
      .post('/incident-statement/G6415GD/1/submitted/edit')
      .send({ incidentStatement: '', incidentStatementComplete: 'yes' })
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Write the full details of the alleged offence')
      })
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.addOrUpdateDraftIncidentStatement.mockRejectedValue(new Error('error message content'))
    return request(app)
      .post('/incident-statement/G6415GD/1/submitted/edit')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
