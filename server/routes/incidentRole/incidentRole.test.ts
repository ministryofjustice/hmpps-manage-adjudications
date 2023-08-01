import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService }, { originalRadioSelection: 'incited' })
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    })
  )

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 100,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2022-03-23T09:10:00',
      dateTimeOfDiscovery: '2022-03-23T09:10:00',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-role', () => {
  it('should load the incident role page 1', () => {
    return request(app)
      .get(adjudicationUrls.incidentRole.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What was Udfsanaye Aidetria’s role in this incident?')
      })
  })
})

describe('POST /incident-role', () => {
  it('should redirect to type of offence page if roles are complete', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentRole.urls.start(100)}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.incidentAssociate.urls.start(100, 'incited'))
  })
  it('should render an error summary with correct validation message - missing radio button selection', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentRole.urls.start(100)}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '11', minute: '30' } },
        locationId: 2,
      })
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select the prisoner’s role in this incident')
      })
  })
})
