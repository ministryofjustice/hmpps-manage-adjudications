import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

const draftAdjudication = (statement: { statement: string; completed: boolean }) => {
  return {
    id: 1041,
    chargeNumber: '123456',
    prisonerNumber: 'A7937DY',
    incidentDetails: {
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      dateTimeOfIncident: '2023-01-01T06:00:00',
    },
    incidentStatement: statement,
    startedByUserId: 'USER1',
    isYouthOffender: false,
  }
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'A7937DY',
      firstName: 'UDFSANAYE',
      lastName: 'AIDETRIA',
    })
  )

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: draftAdjudication(null),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-statement', () => {
  it('should load the incident statement page', () => {
    return request(app)
      .get(adjudicationUrls.incidentStatement.urls.start(1041))
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
        draftAdjudication: draftAdjudication({
          statement: 'Lorem Ipsum',
          completed: true,
        }),
      })
    })
    it('should redirect to the task page', () => {
      return request(app)
        .post(adjudicationUrls.incidentStatement.urls.start(1041))
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Location', adjudicationUrls.taskList.urls.start(1041))
    })
  })
  describe('Statement incomplete', () => {
    beforeEach(() => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 1041,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          prisonerNumber: 'A7937DY',
          incidentStatement: {
            statement: 'Lorem Ipsum',
            completed: false,
          },
        }),
      })
    })
    it('should redirect to the task page', () => {
      return request(app)
        .post(adjudicationUrls.incidentStatement.urls.start(1041))
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'no' })
        .expect('Location', adjudicationUrls.taskList.urls.start(1041))
    })
  })

  describe('Incident statement AND offence details are complete', () => {
    beforeEach(() => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 1041,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          prisonerNumber: 'A7937DY',
          dateTimeOfIncident: '2022-03-23T09:10:00',
          incidentStatement: {
            statement: 'Lorem Ipsum',
            completed: true,
          },
          offenceDetails: {
            offenceCode: 4,
            victimPrisonersNumber: '',
          },
        }),
      })
    })
    it('should redirect to check your answers page ', () => {
      return request(app)
        .post(adjudicationUrls.incidentStatement.urls.start(1041))
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(1041))
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
        .post(adjudicationUrls.incidentStatement.urls.start(1041))
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('There is a problem')
          expect(res.text).toContain('Select yes if you’ve completed your statement')
        })
    })
    it('should throw an error on api failure', () => {
      placeOnReportService.addOrUpdateDraftIncidentStatement.mockRejectedValue(new Error('error message content'))
      return request(app)
        .post(adjudicationUrls.incidentStatement.urls.start(1041))
        .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Error: error message content')
        })
    })
  })
})
