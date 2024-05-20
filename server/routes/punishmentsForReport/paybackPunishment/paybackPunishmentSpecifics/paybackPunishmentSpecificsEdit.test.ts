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
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.PAYBACK,
    measurement: PunishmentMeasurement.HOURS,
    duration: 8,
    endDate: '2025-01-01',
  })
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
      .get(adjudicationUrls.paybackPunishmentSpecifics.urls.edit('100', 'abc'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.paybackPunishmentSpecifics.urls.edit('100', 'abc'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Do you have the details of the payback punishment?')
      })
  })
})

describe('POST', () => {
  it('should edit the data in the session and redirect if the user selects no', () => {
    return request(app)
      .post(`${adjudicationUrls.paybackPunishmentSpecifics.urls.edit('100', 'abc')}`)
      .send({
        paybackPunishmentSpecifics: 'NO',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.awardPunishments.urls.modified('100')}`)
      .then(() =>
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PAYBACK,
            measurement: PunishmentMeasurement.HOURS,
            duration: null,
            endDate: null,
            rehabilitativeActivities: [],
          },
          '100',
          'abc'
        )
      )
  })
  it('should not edit the data to the session if the user selects yes', () => {
    return request(app)
      .post(`${adjudicationUrls.paybackPunishmentSpecifics.urls.edit('100', 'abc')}`)
      .send({
        paybackPunishmentSpecifics: 'YES',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.paybackPunishmentDuration.urls.edit('100', 'abc')}`)
      .then(() => expect(punishmentsService.updateSessionPunishment).not.toHaveBeenCalled())
  })
})
