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

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
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
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      dateTimeOfIncident: '2022-03-23T09:10:00',
    }),
  })

  placeOnReportService.updateDraftIncidentRole.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 34,
      prisonerNumber: 'G6415GD',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      dateTimeOfIncident: '2022-03-23T09:10:00',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-role/<id>', () => {
  it('should load the incident role page', () => {
    return request(app)
      .get(adjudicationUrls.incidentRole.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What was Udfsanaye Aidetria’s role in this incident?')
      })
  })
})

describe('POST /incident-role/<id> without draft offence data', () => {
  it('should redirect to offence selection page if details are complete after changing information', () => {
    return request(app)
      .post(adjudicationUrls.incidentRole.urls.start(100))
      .send({
        currentRadioSelected: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
  })
  it('should redirect to offence selection page even if role not changed', () => {
    return request(app)
      .post(adjudicationUrls.incidentRole.urls.start(100))
      .send({
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
  })
  it('should throw an error on PUT endpoint failure', () => {
    placeOnReportService.updateDraftIncidentRole.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(adjudicationUrls.incidentRole.urls.start(100))
      .send({
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
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.updateDraftIncidentRole).toHaveBeenCalledWith(
          100,
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
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'attempted',
      })
      .expect(302)
      .then(() =>
        expect(placeOnReportService.updateDraftIncidentRole).toHaveBeenCalledWith(
          100,
          null,
          true, // RemoveOffences
          expect.anything()
        )
      )
  })
})

describe('POST /incident-role/<id> with existing draft offences', () => {
  beforeEach(() => {
    placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
      draftAdjudication: testData.draftAdjudication({
        id: 100,
        prisonerNumber: 'G6415GD',
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        dateTimeOfIncident: '2022-03-23T09:10:00',
        offenceDetails: {
          offenceCode: 1001,
          offenceRule: {
            paragraphNumber: '1',
            paragraphDescription: 'Commits any assault',
          },
          victimPrisonersNumber: 'G5512G',
        },
      }),
    })
  })

  it('should redirect to offence selection page if details are complete after changing information', () => {
    return request(app)
      .post(adjudicationUrls.incidentRole.urls.start(100))
      .send({
        currentRadioSelected: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
  })
  it.each(['incited', 'assisted'])(
    'should redirect to associated prisoner selection page for %p if details are complete after changing information',
    (role: string) => {
      return request(app)
        .post(adjudicationUrls.incidentRole.urls.start(100))
        .send({
          currentRadioSelected: role,
        })
        .expect(302)
        .expect('Location', adjudicationUrls.incidentAssociate.urls.start(100, role))
    }
  )
  it('should redirect to offence details page if role not changed', () => {
    return request(app)
      .post(adjudicationUrls.incidentRole.urls.start(100))
      .send({
        currentRadioSelected: 'committed',
        originalIncidentRoleSelection: 'committed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(100))
  })
})
