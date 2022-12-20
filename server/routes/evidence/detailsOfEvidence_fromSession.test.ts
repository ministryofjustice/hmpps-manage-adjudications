import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { EvidenceCode } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/evidenceSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const evidenceSessionService = new EvidenceSessionService() as jest.Mocked<EvidenceSessionService>

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G6415GD',
  prisonerNumber: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  currentLocation: undefined,
  physicalAttributes: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const adjudicationWithoutEvidence = {
  draftAdjudication: {
    id: 100,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    isYouthOffender: false,
    incidentRole: {},
    offenceDetails: {
      offenceCode: 2004,
      offenceRule: {
        paragraphNumber: '3',
        paragraphDescription: 'Detains any person against their will',
      },
      victimOtherPersonsName: 'Jacob Jacobson',
    },
    startedByUserId: 'TEST_GEN',
  },
}

const evidenceOnSession = {
  photoVideo: [
    {
      code: EvidenceCode.CCTV,
      details: 'some details here',
      reporter: 'NCLAMP_GEN',
    },
    {
      code: EvidenceCode.PHOTO,
      details: 'some details here',
      reporter: 'NCLAMP_GEN',
    },
    {
      code: EvidenceCode.BODY_WORN_CAMERA,
      details: 'some details here',
      reporter: 'NCLAMP_GEN',
      identifier: 'BWC: 123456',
    },
  ],
  baggedAndTagged: [
    {
      code: EvidenceCode.BAGGED_AND_TAGGED,
      details: 'some details here',
      reporter: 'NCLAMP_GEN',
      identifier: 'JO345',
    },
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
      .get(adjudicationUrls.detailsOfEvidence.urls.modified(100))
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
      .get(adjudicationUrls.detailsOfEvidence.urls.modified(100))
      .expect(200)
      .then(() => expect(evidenceSessionService.setAllSessionEvidence).not.toHaveBeenCalled())
      .then(() => expect(evidenceSessionService.getAllSessionEvidence).toHaveBeenCalledWith(expect.anything(), 100))
  })
})

describe('POST', () => {
  it('should call the save endpoint with evidence present', () => {
    evidenceSessionService.getAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    evidenceSessionService.getAndDeleteAllSessionEvidence.mockReturnValueOnce(evidenceOnSession)
    const evidenceToSave = [...evidenceOnSession.photoVideo, ...evidenceOnSession.baggedAndTagged]
    return request(app)
      .post(adjudicationUrls.detailsOfEvidence.urls.modified(100))
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveEvidenceDetails).toHaveBeenCalledWith(100, evidenceToSave, expect.anything())
      )
  })
})
