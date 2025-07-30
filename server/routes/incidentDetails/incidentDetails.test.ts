import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, locationService },
    { originalRadioSelection: 'incited', G6415GD: { gender: PrisonerGender.MALE } },
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    }),
  )

  placeOnReportService.startNewDraftAdjudication.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 1,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-10-27T13:30:00.000',
      dateTimeOfDiscovery: '2021-10-27T13:30:00.000',
      incidentRole: {
        associatedPrisonersNumber: 'G2678PF',
        roleCode: '25b',
      },
    }),
  })
  placeOnReportService.getReporterName.mockResolvedValue('Test User')
  locationService.getIncidentLocations.mockResolvedValue([])
  placeOnReportService.getPrisonerGenderFromSession.mockResolvedValue(PrisonerGender.MALE)
  placeOnReportService.getAndDeletePrisonerGenderFromSession.mockResolvedValue(PrisonerGender.MALE)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-details', () => {
  it('should load the incident details page', () => {
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
      })
  })
})

describe('POST /incident-details', () => {
  it('should redirect to applicable rules page if details are complete', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
        discoveryRadioSelected: 'Yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.ageOfPrisoner.urls.start(1))
  })
  it('should render an error summary with correct validation message - incorrect time entered', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '66', minute: '30' } },
        locationId: 2,
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        discoveryRadioSelected: 'Yes',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter an hour between 00 and 23')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.startNewDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        locationId: 2,
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
        discoveryRadioSelected: 'Yes',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })

  it('should verify supply optional discoveryDate ', async () => {
    locationService.getCorrespondingNomisLocationId.mockResolvedValue(2)
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '26/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '', time: { hour: '', minute: '' } },
        locationId: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
        discoveryRadioSelected: 'Yes',
      })
      .expect(() => {
        expect(placeOnReportService.startNewDraftAdjudication).toBeCalledWith(
          '2021-10-26T13:30',
          2,
          '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          'G6415GD',
          expect.anything(),
          PrisonerGender.MALE,
          '2021-10-26T13:30',
        )
      })
  })

  it('should contain "Date of discovery" ', () => {
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      .expect(res => {
        expect(res.text).toContain('Date of discovery')
      })
  })
  it('should not call getPrisonerDetails to get the prisoner gender if it is stored on the session', () => {
    locationService.getCorrespondingNomisLocationId.mockResolvedValue(2)

    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
        discoveryRadioSelected: 'Yes',
      })
      .expect(() => {
        expect(placeOnReportService.getPrisonerDetails).toBeCalledTimes(0)
        expect(placeOnReportService.getPrisonerGenderFromSession).toBeCalledTimes(1)
        expect(placeOnReportService.getAndDeletePrisonerGenderFromSession).toBeCalledTimes(1)
        expect(placeOnReportService.startNewDraftAdjudication).toBeCalledWith(
          '2021-10-27T13:30',
          2,
          '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          'G6415GD',
          expect.anything(),
          PrisonerGender.MALE,
          '2021-10-27T13:30',
        )
      })
  })
})
