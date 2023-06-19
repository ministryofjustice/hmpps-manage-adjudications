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

describe('GET /punishment-comment/:adjudicationNumber/delete/:id', () => {
  it('should load punishment comment confirm deletion page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentComment.urls.delete(100, 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you want to remove this comment?')
        expect(res.text).toContain('Comment text')
      })
  })
  it('should show error message if punishment comment no found', () => {
    punishmentsService.getPunishmentCommentsFromServer.mockResolvedValue([])
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(punishmentsService.removePunishmentComment).not.toBeCalled()
      })
  })
})

describe('POST /punishment-comment/:adjudicationNumber/delete/:id', () => {
  it('should show error message if delete option is not chosen', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Please select required option')
        expect(punishmentsService.removePunishmentComment).not.toBeCalled()
      })
  })
  it('should not delete if "No" option chosen', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .send({
        removeComment: 'no',
      })
      .then(() => expect(punishmentsService.removePunishmentComment).not.toBeCalled())
  })
  it('should not delete if user does not have role "ADJUDICATIONS_REVIEWER"', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .send({
        removeComment: 'yes',
      })
      .then(() => expect(punishmentsService.removePunishmentComment).not.toBeCalled())
  })
  it('should successfully call the endpoint if "Yes" option chosen', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .send({
        removeComment: 'yes',
      })
      .then(() => expect(punishmentsService.removePunishmentComment).toHaveBeenCalledWith(100, 1, expect.anything()))
  })
  it('should redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishmentComment.urls.delete(100, 1)}`)
      .send({
        removeComment: 'yes',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.punishmentsAndDamages.urls.review(100)}`)
  })
})
