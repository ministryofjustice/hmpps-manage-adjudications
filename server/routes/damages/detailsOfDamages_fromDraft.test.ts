import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DamageCode } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/damagesSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const damagesSessionService = new DamagesSessionService() as jest.Mocked<DamagesSessionService>
const testData = new TestData()

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

const adjudicationWithDamages = {
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
    damages: [testData.singleDamage({}), testData.singleDamage({})],
  }),
}

const adjudicationWithoutDamagesNewNoSave = {
  draftAdjudication: testData.draftAdjudication({
    id: 101,
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

const adjudicationWithoutDamagesSaved = {
  draftAdjudication: testData.draftAdjudication({
    id: 102,
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
    otherData: {
      damagesSaved: true,
    },
  }),
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockImplementation(adjudicationId => {
    switch (adjudicationId) {
      case adjudicationWithDamages.draftAdjudication.id:
        return Promise.resolve(adjudicationWithDamages)
      case adjudicationWithoutDamagesNewNoSave.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutDamagesNewNoSave)
      case adjudicationWithoutDamagesSaved.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutDamagesSaved)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  placeOnReportService.saveDamageDetails.mockResolvedValue(adjudicationWithoutDamagesSaved)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, damagesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /damages', () => {
  it('should load the damages page', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Redecoration')
        expect(res.text).toContain('Some damage details')
        expect(res.text).toContain('Some damage details')
      })
  })
  it('should not have used the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.start(100))
      .expect(200)
      .then(() =>
        expect(damagesSessionService.setAllSessionDamages).toHaveBeenCalledWith(
          expect.anything(),
          [
            {
              code: DamageCode.REDECORATION,
              details: 'Some damage details',
              reporter: 'TESTER_GEN',
            },
            {
              code: DamageCode.REDECORATION,
              details: 'Some damage details',
              reporter: 'TESTER_GEN',
            },
          ],
          100
        )
      )
      .then(() => expect(damagesSessionService.getAllSessionDamages).not.toHaveBeenCalled())
  })
  it('should save the damages (even with empty list) if first time calling endpoint', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfDamages.urls.start(101))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfDamages.urls.start(101))
          .then(() => expect(placeOnReportService.saveDamageDetails).toHaveBeenCalledWith(101, [], expect.anything()))
      )
  })
  it('should not save the damages list if this is not the first time calling the endpoint and no changes have been made', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfDamages.urls.start(102))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfDamages.urls.start(102))
          .then(() => expect(placeOnReportService.saveDamageDetails).not.toHaveBeenCalled())
      )
  })
})
