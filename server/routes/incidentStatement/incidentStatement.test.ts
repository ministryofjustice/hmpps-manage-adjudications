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
    offenderNo: 'A7937DY',
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
    prisonerNumber: 'A7937DY',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 1041,
      prisonerNumber: 'A7937DY',
      incidentDetails: {
        locationId: 27022,
        dateTimeOfIncident: '2022-03-23T09:10:00',
        handoverDeadline: '2022-03-25T09:10:00',
      },
      incidentRole: {},
      offenceDetails: [],
      incidentStatement: {
        statement: 'Lorem Ipsum',
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
      .get('/incident-statement/A7937DY/1041')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident statement')
      })
  })
})

describe('POST /incident-statement', () => {
  describe('Statement complete, offence details incomplete', () => {
    beforeEach(() => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: {
          id: 1041,
          prisonerNumber: 'A7937DY',
          incidentDetails: {
            locationId: 27022,
            dateTimeOfIncident: '2022-03-23T09:10:00',
            handoverDeadline: '2022-03-25T09:10:00',
          },
          incidentRole: {},
          offenceDetails: [],
          incidentStatement: {
            statement: 'Lorem Ipsum',
            completed: true,
          },
          startedByUserId: 'TEST2_GEN',
        },
      })
    })
    it('should redirect to the task page', () => {
      return request(app)
        .post('/incident-statement/A7937DY/1041')
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Location', '/place-the-prisoner-on-report/1041')
    })
  })
  describe('Statement incomplete', () => {
    beforeEach(() => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: {
          id: 1041,
          prisonerNumber: 'A7937DY',
          incidentDetails: {
            locationId: 27022,
            dateTimeOfIncident: '2022-03-23T09:10:00',
            handoverDeadline: '2022-03-25T09:10:00',
          },
          incidentRole: {},
          offenceDetails: [],
          incidentStatement: {
            statement: 'Lorem Ipsum',
            completed: false,
          },
          startedByUserId: 'TEST2_GEN',
        },
      })
    })
    it('should redirect to the task page', () => {
      return request(app)
        .post('/incident-statement/A7937DY/1041')
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'no' })
        .expect('Location', '/place-the-prisoner-on-report/1041')
    })
  })

  describe('Incident statement AND offence details are complete', () => {
    beforeEach(() => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: {
          id: 1041,
          prisonerNumber: 'A7937DY',
          incidentDetails: {
            locationId: 27022,
            dateTimeOfIncident: '2022-03-23T09:10:00',
            handoverDeadline: '2022-03-25T09:10:00',
          },
          incidentRole: {
            roleCode: '25a',
          },
          offenceDetails: [
            {
              offenceCode: 4,
              victimPrisonersNumber: '',
            },
          ],
          incidentStatement: {
            statement: 'Lorem Ipsum',
            completed: true,
          },
          startedByUserId: 'TEST2_GEN',
        },
      })
    })
    it('should redirect to check your answers page ', () => {
      return request(app)
        .post('/incident-statement/A7937DY/1041')
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Location', '/check-your-answers/A7937DY/1041')
        .expect(_ => {
          expect(placeOnReportService.addOrUpdateDraftIncidentStatement).toHaveBeenLastCalledWith(
            1041,
            'Lorem Ipsum',
            true,
            expect.anything()
          )
        })
    })
    it('should render error summary with correct validation message', () => {
      return request(app)
        .post('/incident-statement/A7937DY/1041')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('There is a problem')
          expect(res.text).toContain('Select yes if you have completed your statement')
        })
    })
    it('should throw an error on api failure', () => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockRejectedValue(new Error('error message content'))
      return request(app)
        .post('/incident-statement/A7937DY/1041')
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Error: error message content')
        })
    })
  })
})
