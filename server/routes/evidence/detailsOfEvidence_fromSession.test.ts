import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { EvidenceCode } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/evidenceSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const evidenceSessionService = new EvidenceSessionService() as jest.Mocked<EvidenceSessionService>
const testData = new TestData()

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

const adjudicationWithoutEvidence = {
  draftAdjudication: testData.draftAdjudication({
    id: 10,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    dateTimeOfIncident: '2021-12-09T10:30:00',
  }),
}

const evidenceOnSession = {
  photoVideo: [
    testData.singleEvidence({
      code: EvidenceCode.CCTV,
    }),
    testData.singleEvidence({
      code: EvidenceCode.PHOTO,
    }),
    testData.singleEvidence({
      code: EvidenceCode.BODY_WORN_CAMERA,
      identifier: 'BWC: 123456',
    }),
  ],
  baggedAndTagged: [
    testData.singleEvidence({
      identifier: 'JO345',
    }),
  ],
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithoutEvidence)
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)
  app = appWithAllRoutes({ production: false }, { placeOnReportService, evidenceSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /evidence/100', () => {
  beforeEach(() => {
    evidenceSessionService.getAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    evidenceSessionService.getAndDeleteAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    app = appWithAllRoutes({ production: false }, { placeOnReportService, evidenceSessionService })
  })
  it('should load the evidence page with details from the session', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfEvidence.urls.modified('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Photo')
        expect(res.text).toContain('Body-worn camera')
        expect(res.text).toContain('CCTV')
        expect(res.text).toContain('JO345')
      })
  })
  it('should use the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfEvidence.urls.modified('100'))
      .expect(200)
      .then(() => expect(evidenceSessionService.setAllSessionEvidence).not.toHaveBeenCalled())
      .then(() => expect(evidenceSessionService.getAllSessionEvidence).toHaveBeenCalledWith(expect.anything(), '100'))
  })
})

describe('POST', () => {
  it('should call the save endpoint with evidence present', () => {
    evidenceSessionService.getAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    evidenceSessionService.getAndDeleteAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    const evidenceToSave = [...evidenceOnSession.photoVideo, ...evidenceOnSession.baggedAndTagged]
    return request(app)
      .post(adjudicationUrls.detailsOfEvidence.urls.modified('100'))
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveEvidenceDetails).toHaveBeenCalledWith('100', evidenceToSave, expect.anything())
      )
  })
})
