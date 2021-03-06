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
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-report', () => {
  describe('with results', () => {
    beforeEach(() => {
      placeOnReportService.getAllDraftAdjudicationsForUser.mockResolvedValue([
        {
          id: 31,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 357591,
            dateTimeOfIncident: '2021-10-12T20:00:00',
          },
          incidentRole: {},
          incidentStatement: {
            statement: 'This is my statement',
            completed: false,
          },
          startedByUserId: 'NCLAMP_GEN',
          displayName: 'Aidetria, Udfsanaye',
          friendlyName: 'Udfsanaye Aidetria',
          incidentDate: '12 October 2021',
          incidentTime: '20:00',
        },
        {
          id: 58,
          prisonerNumber: 'G5966UI',
          incidentDetails: {
            locationId: 27187,
            dateTimeOfIncident: '2021-11-11T15:15:00',
          },
          incidentRole: {},
          incidentStatement: {
            statement: 'Test statement',
            completed: true,
          },
          startedByUserId: 'NCLAMP_GEN',
          displayName: 'Babik, Carroll',
          friendlyName: 'Carroll Babik',
          incidentDate: '11 November 2021',
          incidentTime: '15:15',
        },
      ])
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.selectReport.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Select a report')
          expect(response.text).toContain('Aidetria, Udfsanaye')
          expect(response.text).toContain('12 October 2021')
          expect(response.text).toContain('Continue')
          expect(response.text).toContain('Babik, Carroll')
          expect(response.text).toContain('11 November 2021')
          expect(response.text).toContain('Continue')
        })
    })
  })
  describe('without results', () => {
    beforeEach(() => {
      placeOnReportService.getAllDraftAdjudicationsForUser.mockResolvedValue([])
    })
    it('shows default message', () => {
      return request(app)
        .get(adjudicationUrls.selectReport.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Select a report')
          expect(response.text).toContain('There are no reports for you to continue.')
        })
    })
  })
})
