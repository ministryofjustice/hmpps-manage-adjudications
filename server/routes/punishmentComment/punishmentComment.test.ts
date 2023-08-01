import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'

jest.mock('../../services/userService')
jest.mock('../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment-comment', () => {
  beforeEach(() => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentComment.urls.add(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment-comment', () => {
  it('should load punishment comment page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentComment.urls.add(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a comment about punishments')
      })
  })
})

describe('POST /punishment-comment', () => {
  it('should show error message if comment is blank', () => {
    return request(app)
      .post(adjudicationUrls.punishmentComment.urls.add(100))
      .send({
        punishmentComment: ' ',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a comment')
      })
  })
  it('should successfully call the endpoint', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.add(100)}`)
      .send({
        punishmentComment: 'some text',
      })
      .then(() =>
        expect(punishmentsService.createPunishmentComment).toHaveBeenCalledWith(100, 'some text', expect.anything())
      )
  })
  it('should redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.add(100)}`)
      .send({
        punishmentComment: 'some text',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.punishmentsAndDamages.urls.review(100)}`)
  })
})
