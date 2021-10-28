import PlaceOnReportService from '../../services/placeOnReportService'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

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

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-statement', () => {
  it('should load the incident statement page', done => {
    done()
  })
})
