import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { EvidenceCode, EvidenceDetails } from '../../data/DraftAdjudicationResult'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/evidenceSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const evidenceSessionService = new EvidenceSessionService() as jest.Mocked<EvidenceSessionService>
const testData = new TestData()

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

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

const adjudicationWithoutEvidenceNewNoSave = {
  draftAdjudication: {
    id: 101,
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
  },
}

const adjudicationWithoutEvidenceSaved = {
  draftAdjudication: {
    id: 102,
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
    },
    startedByUserId: 'TEST_GEN',
    evidence: [] as EvidenceDetails[],
    evidenceSaved: true,
  },
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockImplementation(adjudicationId => {
    switch (adjudicationId) {
      case adjudicationWithEvidence.draftAdjudication.id:
        return Promise.resolve(adjudicationWithEvidence)
      case adjudicationWithoutEvidenceNewNoSave.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutEvidenceNewNoSave)
      case adjudicationWithoutEvidenceSaved.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutEvidenceSaved)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  placeOnReportService.saveEvidenceDetails.mockResolvedValue(adjudicationWithoutEvidenceSaved)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, evidenceSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
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
describe('POST', () => {
  it('should save the evidence if it is the first time calling the endpoint (even if list is empty)', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfEvidence.urls.start(101))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfEvidence.urls.start(101))
          .then(() => expect(placeOnReportService.saveEvidenceDetails).toHaveBeenCalledWith(101, [], expect.anything()))
      )
  })
  it('should not save the evidence if it is the not first time calling the endpoint and no changes have been made', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfEvidence.urls.start(102))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfEvidence.urls.start(102))
          .then(() => expect(placeOnReportService.saveEvidenceDetails).not.toHaveBeenCalled())
      )
  })
})
