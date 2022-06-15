import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import { updateDataOnDeleteReturn, updateDataOnSearchReturn } from './incidentRolePage'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

const originalIncidentDetails = {
  incidentDetails: {
    prisonerNumber: 'BB2345B',
    incidentDate: {
      date: '11-2-2022',
      time: {
        hour: '11',
        minute: '12',
      },
    },
    locationId: 123,
    currentIncidentRoleSelection: IncidentRole.ASSISTED,
    currentAssociatedPrisonerNumber: 'AA1234A',
  },
}

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

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 100,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 2,
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

  placeOnReportService.updateDraftIncidentRole.mockResolvedValue({
    draftAdjudication: {
      startedByUserId: 'TEST_GEN',
      id: 34,
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

describe('updateDataOnSearchReturn', () => {
  it('should use the search data in the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      selectedPerson: 'CC3456C',
    }
    const updatedIncidentDetails = updateDataOnSearchReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toEqual('CC3456C')
  })
})

describe('updateDataOnDeleteReturn', () => {
  it('should remove the associated prisoner from the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      deleteWanted: 'true',
    }
    const updatedIncidentDetails = updateDataOnDeleteReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toBeNull()
  })

  it('should preserve the associated prisoner from the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      deleteWanted: 'false',
    }
    const updatedIncidentDetails = updateDataOnDeleteReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toEqual('AA1234A')
  })

  describe('GET /incident-role/<id>', () => {
    it('should load the incident role page', () => {
      return request(app)
        .get(adjudicationUrls.incidentRole.urls.start(100))
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('What was Udfsanaye Aidetria’s role in the incident?')
        })
    })
  })

  describe('POST /incident-role/<id>', () => {
    it('should redirect to offence details page if details are complete after changing information', () => {
      return request(app)
        .post(adjudicationUrls.incidentRole.urls.start(100))
        .send({
          incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
          locationId: 2,
          currentRadioSelected: 'committed',
        })
        .expect(302)
        .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
    })
    it('should render an error summary with correct validation message - user does not search for associated prisoner when required', () => {
      return request(app)
        .post(adjudicationUrls.incidentRole.urls.start(100))
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
        .post(adjudicationUrls.incidentRole.urls.start(100))
        .send({
          incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
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
        .post(adjudicationUrls.incidentRole.urls.start(100))
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
        .post(adjudicationUrls.incidentRole.urls.start(100))
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
})
