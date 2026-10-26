import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import PunishmentsService from '../../../../services/punishmentsService'
import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { PrivilegeType, PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/userService')

const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

const tv = {
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.TV,
  duration: 14,
  startDate: '2026-08-04',
  endDate: '2026-08-17',
  rehabilitativeActivities: [] as RehabilitativeActivity[],
}
const pageUrl = adjudicationUrls.punishmentAlreadyAdded.urls.start('100', 'copy')
const tableUrl = adjudicationUrls.awardPunishments.urls.modified('100')

let app: Express

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getUnconfirmedDuplicate.mockReturnValue({
    punishment: { ...tv, redisId: 'copy' },
    matches: { ...tv, redisId: 'original' },
  })
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('shows the punishment and asks whether to add it again', () =>
    request(app)
      .get(pageUrl)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This punishment has already been added')
        expect(res.text).toContain('Loss of TV')
        expect(res.text).toContain('Do you want to add it again?')
        expect(res.text).not.toContain('data-qa="delete-punishment"')
      }))

  it('goes back to the table when that punishment no longer needs asking about', () => {
    punishmentsService.getUnconfirmedDuplicate.mockReturnValue(null)
    return request(app).get(pageUrl).expect(302).expect('Location', tableUrl)
  })

  it('is not available to users without the reviewer role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get(pageUrl)
      .expect(res => expect(res.text).not.toContain('Do you want to add it again?'))
  })
})

describe('POST', () => {
  it('removes the copy when the answer is no', () =>
    request(app)
      .post(pageUrl)
      .send({ addAgain: 'NO' })
      .expect(302)
      .expect('Location', tableUrl)
      .then(() => {
        expect(punishmentsService.deleteSessionPunishments).toHaveBeenCalledWith(expect.anything(), 'copy', '100')
        expect(punishmentsService.confirmDuplicatePunishment).not.toHaveBeenCalled()
      }))

  it('keeps the copy when the answer is yes', () =>
    request(app)
      .post(pageUrl)
      .send({ addAgain: 'YES' })
      .expect(302)
      .expect('Location', tableUrl)
      .then(() => {
        expect(punishmentsService.confirmDuplicatePunishment).toHaveBeenCalledWith(expect.anything(), '100', 'copy')
        expect(punishmentsService.deleteSessionPunishments).not.toHaveBeenCalled()
      }))

  it('shows an error when no answer is given', () =>
    request(app)
      .post(pageUrl)
      .send({})
      .expect(200)
      .expect(res => expect(res.text).toContain('Select yes if you want to add this punishment again'))
      .then(() => expect(punishmentsService.deleteSessionPunishments).not.toHaveBeenCalled()))

  it('changes nothing when the form was for a different punishment', () => {
    punishmentsService.getUnconfirmedDuplicate.mockReturnValue({
      punishment: { ...tv, redisId: 'another' },
      matches: { ...tv, redisId: 'original' },
    })
    return request(app)
      .post(pageUrl)
      .send({ addAgain: 'NO' })
      .expect(302)
      .expect('Location', tableUrl)
      .then(() => expect(punishmentsService.deleteSessionPunishments).not.toHaveBeenCalled())
  })
})
