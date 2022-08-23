import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/evidenceSessionService.ts')

const evidenceSessionService = new EvidenceSessionService() as jest.Mocked<EvidenceSessionService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { evidenceSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add evidence', () => {
  it('should add the evidence and redirect to the evidence details page', () => {
    return request(app)
      .post(`${adjudicationUrls.detailsOfEvidence.urls.add(100)}`)
      .send({
        evidenceType: 'BAGGED_AND_TAGGED',
        evidenceDescription: 'some details here',
        batIdentifier: 'JO12345',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfEvidence.urls.modified(100))
      .then(() =>
        expect(evidenceSessionService.addSessionEvidence).toHaveBeenCalledWith(
          expect.anything(),
          {
            code: 'BAGGED_AND_TAGGED',
            details: 'some details here',
            reporter: 'user1',
            identifier: 'JO12345',
          },
          100
        )
      )
  })
})
