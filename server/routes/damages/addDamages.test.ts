import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/damagesSessionService.ts')

const damagesSessionService = new DamagesSessionService() as jest.Mocked<DamagesSessionService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { damagesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add damages', () => {
  it('should add the damage and redirect to the damages details page', () => {
    return request(app)
      .post(`${adjudicationUrls.detailsOfDamages.urls.add(100)}`)
      .send({
        damageType: 'REDECORATION',
        damageDescription: 'Repainting required',
        reporter: 'user1',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfDamages.urls.modified(100))
      .then(() =>
        expect(damagesSessionService.addSessionDamage).toHaveBeenCalledWith(
          expect.anything(),
          {
            code: 'REDECORATION',
            details: 'Repainting required',
            reporter: 'user1',
          },
          100
        )
      )
  })
})
