import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

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
      id: 100,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 2,
        dateTimeOfIncident: '2021-10-27T12:30',
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

  placeOnReportService.updateDraftIncidentRole.mockResolvedValue({
    draftAdjudication: {
      startedByUserId: 'TEST_GEN',
      id: 100,
      adjudicationNumber: 1524493,
      incidentDetails: {
        dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
        locationId: 2,
      },
      incidentRole: {},
      prisonerNumber: 'G6415GD',
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-role/<id>/submitted/edit', () => {
  it('should load the incident role edit page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(5)}?referrer=${adjudicationUrls.prisonerReport.urls.report(
          1524455
        )}`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What was Udfsanaye Aidetria’s role in the incident?')
      })
  })
  it('should load the incident role edit page with no referrer', () => {
    return request(app)
      .get(adjudicationUrls.incidentRole.urls.submittedEdit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What was Udfsanaye Aidetria’s role in the incident?')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.getDraftAdjudicationDetails.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get(adjudicationUrls.incidentRole.urls.submittedEdit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})

describe('POST /incident-role/<id>/submitted/edit', () => {
  it('should redirect to offence details page - reporter', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(100))
  })
  it('should redirect to offence details page - reviewer', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(100))
  })
  it('should render an error summary with correct validation message - user does not search for associated prisoner when required', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'incited',
      })
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter their name or prison number.')
      })
  })
  it('should throw an error on PUT endpoint failure', () => {
    placeOnReportService.updateDraftIncidentRole.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'committed',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
  it('should retain existing offences if the radio selection is not changed', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.updateDraftIncidentRole).toHaveBeenCalledWith(
          100,
          null,
          null,
          false, // RemoveOffences
          expect.anything()
        )
      )
  })
  it('should remove existing offences if the radio selection is changed', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(
          100
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'attempted',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.updateDraftIncidentRole).toHaveBeenCalledWith(
          100,
          null,
          null,
          true, // RemoveOffences
          expect.anything()
        )
      )
  })
})
