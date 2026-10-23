import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

const twoPrivileges = {
  items: [
    { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN },
    { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.TV },
  ],
}

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentBatch.mockReturnValue(twoPrivileges)
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Do they all have the same duration and start date?', () => {
  it('asks the question for two or more punishments', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSameDuration.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do they all have the same duration and start date?')
        expect(res.text).toContain('Enter the details once and they will be applied to all of them.')
        expect(res.text).toContain('Enter the details for each punishment separately.')
      })
  })

  it('skips the question for a single punishment', () => {
    punishmentsService.getPunishmentBatch.mockReturnValue({ items: [twoPrivileges.items[0]] })
    punishmentsService.nextPunishmentBatchUrl.mockReturnValue(adjudicationUrls.punishmentDuration.urls.start('100'))
    return request(app)
      .get(adjudicationUrls.punishmentSameDuration.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentDuration.urls.start('100'))
  })

  it.each([
    ['yes', true],
    ['no', false],
  ])('records the answer %s', (sameForAll, expected) => {
    return request(app)
      .post(adjudicationUrls.punishmentSameDuration.urls.start('100'))
      .send({ sameForAll })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentDuration.urls.start('100'))
      .then(() =>
        expect(punishmentsService.setPunishmentBatchSameForAll).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          expected,
        ),
      )
  })

  it('asks for an answer', () => {
    return request(app)
      .post(adjudicationUrls.punishmentSameDuration.urls.start('100'))
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select yes if they all have the same duration and start date')
        expect(res.text).toContain('href="#sameForAll"')
      })
  })
})
