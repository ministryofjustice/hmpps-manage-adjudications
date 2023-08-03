import { Express } from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import TestData from '../../testutils/testData'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    consecutiveReportNumber: 99,
    type: PunishmentType.ADDITIONAL_DAYS,
    days: 10,
  })
  punishmentsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'John',
      lastName: 'Smith',
    })
  )
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
      .get(adjudicationUrls.isPunishmentConsecutive.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.isPunishmentConsecutive.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Will this punishment be consecutive to another one given to John Smith')
      })
  })
})

describe('POST', () => {
  it('should redirect to which punishment is it consecutive to if yes radio is chosen', () => {
    return request(app)
      .post(
        `${adjudicationUrls.isPunishmentConsecutive.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=10`
      )
      .send({
        consecutive: 'yes',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=10&consecutive=yes`
      )
  })
  it('should save and redirect if the no radio is chosen', () => {
    return request(app)
      .post(
        `${adjudicationUrls.isPunishmentConsecutive.urls.edit(
          '100',
          uuidv4()
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=10`
      )
      .send({
        consecutive: 'no',
      })
      .expect(response => {
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 10,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100',
          expect.anything()
        )
      })
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })
})
