import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'A7937DY',
      firstName: 'UDFSANAYE',
      lastName: 'AIDETRIA',
    })
  )

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 1041,
      prisonerNumber: 'A7937DY',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /age-of-prisoner', () => {
  it('should load the age of prisoner page', () => {
    return request(app)
      .get(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Age of the prisoner')
        expect(res.text).toContain('Prison rule 51')
        expect(res.text).toContain('Prison rule 55')
      })
  })
})

describe('POST /age-of-prisoner', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .send({ whichRuleChosen: 'adult' })
      .expect('Location', adjudicationUrls.incidentRole.urls.start(1041))
      .expect(() => expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledTimes(1))
      .expect(() =>
        expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledWith(
          1041,
          'adult',
          true,
          expect.anything()
        )
      )
  })
  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select which rules apply')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.addDraftYouthOffenderStatus.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(`${adjudicationUrls.ageOfPrisoner.urls.start(1041)}`)
      .send({ whichRuleChosen: 'yoi' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})

describe('POST /age-of-prisoner with existing selection of adult', () => {
  it('should request offence deletion if the value is changed', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .send({ whichRuleChosen: 'yoi', originalRuleSelection: 'adult' })
      .expect('Location', adjudicationUrls.incidentRole.urls.start(1041))
      .expect(() => expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledTimes(1))
      .expect(() =>
        expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledWith(
          1041,
          'yoi',
          true,
          expect.anything()
        )
      )
  })
  it('should not request offence deletion if the value is changed', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .send({ whichRuleChosen: 'adult', originalRuleSelection: 'adult' })
      .expect('Location', adjudicationUrls.incidentRole.urls.start(1041))
      .expect(() => expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledTimes(1))
      .expect(() =>
        expect(placeOnReportService.addDraftYouthOffenderStatus).toHaveBeenCalledWith(
          1041,
          'adult',
          false,
          expect.anything()
        )
      )
  })
})
