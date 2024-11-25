import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/damagesSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const damagesSessionService = new DamagesSessionService() as jest.Mocked<DamagesSessionService>
const testData = new TestData()

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

const adjudicationWithoutDamages = {
  draftAdjudication: testData.draftAdjudication({
    id: 100,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    dateTimeOfIncident: '2021-12-09T10:30:00',
    offenceDetails: {
      offenceCode: 2004,
      offenceRule: {
        paragraphNumber: '3',
        paragraphDescription: 'Detains any person against their will',
      },
      victimOtherPersonsName: 'Jacob Jacobson',
    },
  }),
}

const damagesOnSession = [testData.singleDamage({}), testData.singleDamage({})]

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithoutDamages)

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  damagesSessionService.getAllSessionDamages.mockReturnValueOnce(damagesOnSession)

  damagesSessionService.getAndDeleteAllSessionDamages.mockReturnValueOnce(damagesOnSession)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, damagesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /damages/100', () => {
  it('should load the damages page with details from the session', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.modified('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Redecoration')
        expect(res.text).toContain('Some damage details')
        expect(res.text).toContain('Some damage details')
      })
  })
  it('should use the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.modified('100'))
      .expect(200)
      .then(() => expect(damagesSessionService.setAllSessionDamages).not.toHaveBeenCalled())
      .then(() => expect(damagesSessionService.getAllSessionDamages).toHaveBeenCalledWith(expect.anything(), '100'))
  })
})

describe('POST', () => {
  it('should call the save endpoint with evidence present', () => {
    const damagesToSave = [testData.singleDamage({}), testData.singleDamage({})]
    return request(app)
      .post(adjudicationUrls.detailsOfDamages.urls.modified('100'))
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveDamageDetails).toHaveBeenCalledWith('100', damagesToSave, expect.anything())
      )
  })
})
