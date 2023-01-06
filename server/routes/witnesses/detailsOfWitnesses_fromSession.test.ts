import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { WitnessCode } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/witnessesSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const witnessesSessionService = new WitnessesSessionService() as jest.Mocked<WitnessesSessionService>
const testData = new TestData()

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

const adjudicationWithoutWitnesses = {
  draftAdjudication: testData.draftAdjudication({
    id: 100,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
  }),
}

const witnessesOnSession = [
  testData.singleWitness({ code: WitnessCode.OTHER_PERSON }),
  testData.singleWitness({}),
  testData.singleWitness({ code: WitnessCode.STAFF }),
]

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithoutWitnesses)
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)
  app = appWithAllRoutes({ production: false }, { placeOnReportService, witnessesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    witnessesSessionService.getAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    witnessesSessionService.getAndDeleteAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    app = appWithAllRoutes({ production: false }, { placeOnReportService, witnessesSessionService })
  })
  it('should load the page with details from the session', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Prison officer')
        expect(res.text).toContain('Lastname, Firstname')
      })
  })
  it('should use the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect(200)
      .then(() => expect(witnessesSessionService.setAllSessionWitnesses).not.toHaveBeenCalled())
      .then(() => expect(witnessesSessionService.getAllSessionWitnesses).toHaveBeenCalledWith(expect.anything(), 100))
  })
})

describe('POST', () => {
  it('should call the save endpoint with evidence present', () => {
    witnessesSessionService.getAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    witnessesSessionService.getAndDeleteAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    return request(app)
      .post(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveWitnessDetails).toHaveBeenCalledWith(100, witnessesOnSession, expect.anything())
      )
  })
})
