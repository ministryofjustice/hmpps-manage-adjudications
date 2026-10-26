import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import PunishmentsService from '../../../../services/punishmentsService'
import PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'
import RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import type { PunishmentData } from '../../../../data/PunishmentResult'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/punishmentBatchSessionService')
jest.mock('../../../../services/rehabBatchSessionService')
jest.mock('../../../../services/userService')

const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const punishmentBatchSessionService = new PunishmentBatchSessionService() as jest.Mocked<PunishmentBatchSessionService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

const suspendedLibrary: PunishmentData = {
  redisId: 'b',
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.OTHER,
  otherPrivilege: 'library',
  duration: 21,
  suspendedUntil: '2026-09-16',
  rehabilitativeActivities: [
    { sessionId: 1, details: 'Cleaning cells', monitor: 'Thomas Smith', endDate: '2026-09-16', totalSessions: 1 },
  ],
}
const canteen: PunishmentData = {
  redisId: 'a',
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.CANTEEN,
  duration: 21,
  startDate: '2026-08-17',
  endDate: '2026-09-06',
  rehabilitativeActivities: [],
}

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

const withPunishments = (punishments: PunishmentData[]) => {
  punishmentsService.getAllSessionPunishments.mockReturnValue(punishments)
  punishmentsService.filteredPunishments.mockResolvedValue({ damages: [], otherPunishments: punishments })
  punishmentsService.getRehabActivitiesFromSession.mockResolvedValue(
    punishments.flatMap(punishment =>
      punishment.rehabilitativeActivities.map(activity => ({
        ...activity,
        type: punishment.type,
        privilegeType: punishment.privilegeType,
        otherPrivilege: punishment.otherPrivilege,
        changeUrl: '/change',
        removeUrl: '/remove',
        canChangeOrRemove: true,
      })),
    ),
  )
}

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentsFromServer.mockResolvedValue([])
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
  app = appWithAllRoutes(
    { production: false },
    { punishmentsService, userService, punishmentBatchSessionService, rehabBatchSessionService },
  )
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Award punishments with the new journey switched on', () => {
  it('shows the success message once, and clears any open batch', () => {
    withPunishments([canteen])
    punishmentsService.takeSuccessMessage.mockReturnValue('2 punishments added')
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('data-qa="success-banner"')
        expect(res.text).toContain('2 punishments added')
        expect(punishmentBatchSessionService.clear).toHaveBeenCalledWith(expect.anything(), '100')
        expect(rehabBatchSessionService.clear).toHaveBeenCalledWith(expect.anything(), '100')
      })
  })

  it('asks about a punishment added twice before showing the success message', () => {
    withPunishments([canteen])
    punishmentsService.getUnconfirmedDuplicate.mockReturnValue({
      punishment: { ...canteen, redisId: 'copy' },
      matches: { ...canteen, redisId: 'original' },
    })
    punishmentsService.takeSuccessMessage.mockReturnValue('Loss of canteen added')
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentAlreadyAdded.urls.start('100', 'copy'))
      .then(() => {
        // kept for when staff come back to the table
        expect(punishmentsService.takeSuccessMessage).not.toHaveBeenCalled()
        expect(punishmentBatchSessionService.clear).toHaveBeenCalledWith(expect.anything(), '100')
      })
  })

  it('offers a rehabilitative activity when a punishment is suspended on a governor hearing', () => {
    withPunishments([canteen, suspendedLibrary])
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add a rehabilitative activity')
        expect(res.text).toContain(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      })
  })

  it('shows end date and number of sessions in separate columns', () => {
    withPunishments([canteen, suspendedLibrary])
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Number of <br>sessions')
        expect(res.text).not.toContain('End date and <br>number of sessions')
        expect(res.text).toContain('16 Sep 2026')
      })
  })

  it('does not offer a rehabilitative activity when nothing is suspended', () => {
    withPunishments([canteen])
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => expect(res.text).not.toContain('Add a rehabilitative activity'))
  })

  it('does not offer a rehabilitative activity after an independent adjudicator hearing', () => {
    punishmentsService.getPunishmentAvailability.mockResolvedValue({
      isIndependentAdjudicatorHearing: true,
      isAdult: true,
    })
    withPunishments([suspendedLibrary])
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => expect(res.text).not.toContain('Add a rehabilitative activity'))
  })

  it('changes nothing when the prison is not switched on', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = []
    withPunishments([canteen, suspendedLibrary])
    punishmentsService.takeSuccessMessage.mockReturnValue('2 punishments added')
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).not.toContain('Add a rehabilitative activity')
        expect(res.text).not.toContain('2 punishments added')
        expect(res.text).toContain('End date and <br>number of sessions')
        expect(punishmentBatchSessionService.clear).not.toHaveBeenCalled()
      })
  })
})
