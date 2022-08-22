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
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const adjudicationWithEvidence = {
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
    offenceDetails: [
      {
        offenceCode: 2004,
        offenceRule: {
          paragraphNumber: '3',
          paragraphDescription: 'Detains any person against their will',
        },
      },
    ],
    startedByUserId: 'TEST_GEN',
    evidence: [
      {
        code: EvidenceCode.BAGGED_AND_TAGGED,
        details: 'some details here',
        reporter: 'NCLAMP_GEN',
        identifier: 'JO345',
      },
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
  },
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithEvidence)

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, evidenceSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /damages/100', () => {
  it('should load the evidence page', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfEvidence.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Photo')
        expect(res.text).toContain('Body-worn camera')
        expect(res.text).toContain('CCTV')
        expect(res.text).toContain('JO345')
      })
  })
  it('should not have used the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfEvidence.urls.start(100))
      .expect(200)
      .then(() =>
        expect(evidenceSessionService.setAllSessionEvidence).toHaveBeenCalledWith(
          expect.anything(),
          {
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
          },
          100
        )
      )
      .then(() => expect(evidenceSessionService.getAllSessionEvidence).not.toHaveBeenCalled())
  })
})
