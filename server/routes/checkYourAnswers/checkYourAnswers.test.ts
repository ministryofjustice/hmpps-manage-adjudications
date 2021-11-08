import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService })
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
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivindell' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Hogwarts' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Arundel' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Timbuktu' },
    { locationId: 3, locationPrefix: 'P3', userDescription: 'Narnia' },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /check-your-answers', () => {
  it('should load the check-your-answers page', () => {
    return request(app)
      .get('/check-your-answers/G6415GD/1')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers')
        expect(placeOnReportService.getCheckYourAnswersInfo).toHaveBeenCalledTimes(1)
      })
  })
})

// describe('POST /incident-details', () => {
//   it('should redirect to incident statement page if details is complete', () => {
//     return request(app)
//       .post('/check-your-answers/G6415GD/1')
//       .expect(302)
//       .expect('Location', '/prisoner-placed-on-report')
//   })

//   it('should throw an error on api failure', () => {
//     // placeOnReportService.startNewDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
//     return request(app)
//       .post('/check-your-answers/G6415GD/1')
//       .expect(res => {
//         expect(res.text).toContain('Error: Internal Error')
//       })
//   })
// })
