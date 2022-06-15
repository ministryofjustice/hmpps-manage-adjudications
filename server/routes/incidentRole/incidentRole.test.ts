import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService }, { originalRadioSelection: 'incited' })
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    dateOfBirth: undefined,
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
      id: 100,
      prisonerNumber: 'G6415GD',
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

describe('GET /incident-role', () => {
  it('should load the incident role page', () => {
    return request(app)
      .get(adjudicationUrls.incidentRole.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What was Udfsanaye Aidetria’s role in the incident?')
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
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'incited'))
  })
  it('should render an error summary with correct validation message if the selected person has been tampered with in the URL', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentRole.urls.start(100)}?selectedPerson=gobbledegook`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'incited',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter their name or prison number.')
      })
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
        expect(res.text).toContain('Select the prisoner’s role in this incident.')
      })
  })
})
