import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/prisonerSearchService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, prisonerSearchService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    dateOfBirth: undefined,
    physicalAttributes: undefined,
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
      offenceDetails: {
        offenceCode: 1001,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G5512G',
      },

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

describe('GET /associated-prisoner/<id>/submitted/edit', () => {
  it('should load the incident associate edit page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          5,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Who did Udfsanaye Aidetria assist?')
      })
  })
  it('should load the incident associate edit page with no referrer', () => {
    return request(app)
      .get(adjudicationUrls.incidentAssociate.urls.submittedEdit(100, 'assisted'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Who did Udfsanaye Aidetria assist?')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.getDraftAdjudicationDetails.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get(adjudicationUrls.incidentAssociate.urls.submittedEdit(100, 'assisted'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})

describe('POST /associated-prisoner/<id>/submitted/edit', () => {
  it('should update correctly when switching from internal to external', () => {
    prisonerSearchService.isPrisonerNumberValid.mockResolvedValue(true)

    return request(app)
      .post(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          100,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        selectedAnswerId: 'external',
        prisonerId: '1234',
        prisonerOutsideEstablishmentNameInput: 'test',
        prisonerOutsideEstablishmentNumberInput: '12345',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveAssociatedPrisoner).toHaveBeenCalledWith(
          100,
          {
            associatedPrisonersNumber: '12345',
            associatedPrisonersName: 'test',
          },
          expect.anything()
        )
      )
  })
  it('should update correctly when switching from external to internal', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          100,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        selectedAnswerId: 'internal',
        prisonerId: '1234',
        prisonerOutsideEstablishmentNameInput: '',
        prisonerOutsideEstablishmentNumberInput: '',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveAssociatedPrisoner).toHaveBeenCalledWith(
          100,
          {
            associatedPrisonersNumber: '1234',
            associatedPrisonersName: null,
          },
          expect.anything()
        )
      )
  })

  it('should redirect to offence selection page - reporter', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          100,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        selectedAnswerId: 'internal',
        prisonerId: '1234',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'assisted'))
  })

  it('should render an error summary with correct validation message - user does not search for associated prisoner when required', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          100,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        selectedAnswerId: 'external',
        prisonerOutsideEstablishmentNameInput: '1234',
      })
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter the prisoner’s number')
      })
  })
  it('should throw an error on PUT endpoint failure', () => {
    placeOnReportService.saveAssociatedPrisoner.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          100,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        selectedAnswerId: 'internal',
        prisonerId: '1234',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
