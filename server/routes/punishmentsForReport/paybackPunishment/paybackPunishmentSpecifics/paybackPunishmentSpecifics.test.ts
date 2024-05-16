import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentMeasurement, PunishmentType } from '../../../../data/PunishmentResult'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/reportedAdjudicationsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.paybackPunishmentSpecifics.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.paybackPunishmentSpecifics.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you have the details of the payback punishment?')
      })
  })
})

describe('POST', () => {
  it('should add the data to the session and redirect if the user selects no', () => {
    return request(app)
      .post(`${adjudicationUrls.paybackPunishmentSpecifics.urls.start('100')}`)
      .send({
        paybackPunishmentSpecifics: 'NO',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.awardPunishments.urls.modified('100')}`)
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PAYBACK,
            measurement: PunishmentMeasurement.HOURS,
            duration: null,
            lastDay: null,
          },
          '100'
        )
      )
  })
  it('should not add the data to the session if the user selects yes', () => {
    return request(app)
      .post(`${adjudicationUrls.paybackPunishmentSpecifics.urls.start('100')}`)
      .send({
        paybackPunishmentSpecifics: 'YES',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.paybackPunishmentDuration.urls.start('100')}`)
      .then(() => expect(punishmentsService.addSessionPunishment).not.toHaveBeenCalled())
  })
})
