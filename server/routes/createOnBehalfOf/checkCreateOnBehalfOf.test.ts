import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('./createOnBehalfOfSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const createOnBehalfOfSessionService =
  new CreateOnBehalfOfSessionService() as jest.Mocked<CreateOnBehalfOfSessionService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, createOnBehalfOfSessionService })
  createOnBehalfOfSessionService.getRedirectUrl.mockReturnValueOnce(adjudicationUrls.checkYourAnswers.urls.start(100))
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /create-on-behalf-of/confirm', () => {
  it('should load the check page', () => {
    return request(app)
      .get(adjudicationUrls.createOnBehalfOf.urls.check('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers')
        expect(res.text).toContain('Return to report 100')
      })
  })
})

describe('POST /create-on-behalf-of/confirm', () => {
  it('should call CreatedOnBehalfOf', () => {
    createOnBehalfOfSessionService.getCreatedOnBehalfOfEditSubmittedAdjudication.mockReturnValueOnce('true')

    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.check('100'))
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect(() => {
        expect(placeOnReportService.setCreatedOnBehalfOf).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.setDraftCreatedOnBehalfOf).toHaveBeenCalledTimes(0)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfOfficer).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfReason).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfEditSubmittedAdjudication).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteRedirectUrl).toHaveBeenCalledTimes(1)
      })
  })
  it('should call DraftCreatedOnBehalfOf', () => {
    createOnBehalfOfSessionService.getCreatedOnBehalfOfEditSubmittedAdjudication.mockReturnValueOnce('false')

    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.check('100'))
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect(() => {
        expect(placeOnReportService.setCreatedOnBehalfOf).toHaveBeenCalledTimes(0)
        expect(placeOnReportService.setDraftCreatedOnBehalfOf).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfOfficer).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfReason).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteCreatedOnBehalfOfEditSubmittedAdjudication).toHaveBeenCalledTimes(1)
        expect(createOnBehalfOfSessionService.deleteRedirectUrl).toHaveBeenCalledTimes(1)
      })
  })
})
