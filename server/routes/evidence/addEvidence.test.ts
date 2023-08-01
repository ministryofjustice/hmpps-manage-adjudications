import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/evidenceSessionService.ts')

const testData = new TestData()
const evidenceSessionService = new EvidenceSessionService() as jest.Mocked<EvidenceSessionService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { evidenceSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add evidence', () => {
  it('should add the evidence and redirect to the evidence details page - draft adjudication', () => {
    return request(app)
      .post(`${adjudicationUrls.detailsOfEvidence.urls.add('100')}?submitted=false`)
      .send({
        evidenceType: 'BAGGED_AND_TAGGED',
        evidenceDescription: 'Some details here',
        batIdentifier: 'JO12345',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfEvidence.urls.modified('100'))
      .then(() =>
        expect(evidenceSessionService.addSessionEvidence).toHaveBeenCalledWith(
          expect.anything(),
          testData.singleEvidence({ identifier: 'JO12345' }),
          '100'
        )
      )
  })
  it('should add the evidence and redirect to the evidence details page - submitted adjudication edit', () => {
    return request(app)
      .post(`${adjudicationUrls.detailsOfEvidence.urls.add('100')}?submitted=true`)
      .send({
        evidenceType: 'BAGGED_AND_TAGGED',
        evidenceDescription: 'Some details here',
        batIdentifier: 'JO12345',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfEvidence.urls.submittedEditModified('100'))
      .then(() =>
        expect(evidenceSessionService.addSessionEvidence).toHaveBeenCalledWith(
          expect.anything(),
          testData.singleEvidence({ identifier: 'JO12345' }),
          '100'
        )
      )
  })
})
