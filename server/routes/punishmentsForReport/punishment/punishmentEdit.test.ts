import { Express } from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'

const testData = new TestData()
jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/reportedAdjudicationsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
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
    type: PunishmentType.EXCLUSION_WORK,
  })
  reportedAdjudicationsService.getLatestHearing.mockResolvedValue(
    testData.singleHearing({ id: 100, dateTimeOfHearing: '2022-11-03T11:00:00' })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a punishment or money for damages')
      })
  })
})

describe('POST /punishment', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishment.urls.edit('100', 'XYZ')}`)
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'nintendo switch',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
      )
  })
})
