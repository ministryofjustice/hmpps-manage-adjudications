import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import TestData from '../testutils/testData'

jest.mock('../../services/userService')
jest.mock('../../services/punishmentsService')

const testData = new TestData()
const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentCommentsFromServer.mockResolvedValue([testData.singlePunishmentComment({})])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('load edit punishment comment page', () => {
  it('should load the `Page not found` page if no role ADJUDICATIONS_REVIEWER', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
    return request(app)
      .get(adjudicationUrls.punishmentComment.urls.edit('100', 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
  it('should load the `Page not found` page if punishment comment not found in database', () => {
    punishmentsService.getPunishmentCommentsFromServer.mockResolvedValue([])
    return request(app)
      .get(`${adjudicationUrls.punishmentComment.urls.edit('100', 1)}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(punishmentsService.editPunishmentComment).not.toBeCalled()
      })
  })
  it('should load punishment comment page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentComment.urls.edit('100', 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a comment about punishments')
      })
  })
})

describe('submit edited punishment comment', () => {
  it('should show error message if comment is blank', () => {
    punishmentsService.getPunishmentCommentsFromServer.mockResolvedValue([
      testData.singlePunishmentComment({ comment: '' }),
    ])
    return request(app)
      .post(adjudicationUrls.punishmentComment.urls.edit('100', 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a comment')
      })
  })
  it('should successfully call the endpoint', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.edit('100', 1)}`)
      .send({
        punishmentComment: 'new text',
      })
      .then(() => {
        expect(punishmentsService.editPunishmentComment).toHaveBeenCalledWith(100, 1, 'new text', expect.anything())
      })
  })
  it('should redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.edit('100', 1)}`)
      .send({
        punishmentComment: 'new text',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.punishmentsAndDamages.urls.review('100')}`)
  })
})
