import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    socialVisitsAvailable: true,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a punishment or money for damages')
        expect(res.text).toContain('Loss of social visits')
        expect(res.text).toContain('Restriction of social visits')
        expect(res.text).toContain('Does the prisoner have any children under 18?')
      })
  })

  it('does not offer social visits punishments for a YOI adjudication', async () => {
    punishmentsService.getPunishmentAvailability.mockResolvedValue({
      isIndependentAdjudicatorHearing: false,
      socialVisitsAvailable: false,
    })

    await request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).not.toContain('Loss of social visits')
        expect(res.text).not.toContain('Restriction of social visits')
      })
  })
})

describe('POST /punishment', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishment.urls.start('100')}`)
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'nintendo switch',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`,
      )
  })

  it.each([
    [PunishmentType.LOSS_OF_SOCIAL_VISITS, 'lossHasChildUnder18', 'true'],
    [PunishmentType.RESTRICTION_OF_SOCIAL_VISITS, 'restrictionHasChildUnder18', 'false'],
  ])('carries the child answer into the schedule for %s', (punishmentType, childField, hasChildUnder18) => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType, [childField]: hasChildUnder18 })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100',
        )}?punishmentType=${punishmentType}&hasChildUnder18=${hasChildUnder18}`,
      )
  })

  it.each([
    [PunishmentType.LOSS_OF_SOCIAL_VISITS, 'lossHasChildUnder18'],
    [PunishmentType.RESTRICTION_OF_SOCIAL_VISITS, 'restrictionHasChildUnder18'],
  ])('links the missing child-answer error to the %s question', (punishmentType, childField) => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select whether the prisoner has any children under 18')
        expect(res.text).toContain(`href="#${childField}"`)
        expect(res.text).toContain(`id="${childField}"`)
      })
  })
})
