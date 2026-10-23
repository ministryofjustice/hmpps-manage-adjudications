import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'
import config from '../../../config'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['MDI']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('GET /punishment with multiple privileges switched on', () => {
  it('offers the privileges as checkboxes and Save and exit', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('data-qa="privilege-checkboxes"')
        expect(res.text).toContain('name="privilegeTypes"')
        expect(res.text).toContain('Select all that apply.')
        expect(res.text).toContain('Save and exit')
        expect(res.text).not.toContain('data-qa="privilege-radio-buttons"')
      })
  })

  it('does not offer a privilege that has already been added, apart from Other', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN, rehabilitativeActivities: [] },
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'library',
        rehabilitativeActivities: [],
      },
    ])
    return request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).not.toContain('value="CANTEEN"')
        expect(res.text).toContain('value="TV"')
        expect(res.text).toContain('value="OTHER"')
      })
  })

  it('keeps radios when the prison is not switched on', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['LEI']
    return request(app)
      .get(adjudicationUrls.punishment.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('data-qa="privilege-radio-buttons"')
        expect(res.text).not.toContain('Save and exit')
      })
  })

  it('keeps radios when changing a punishment', () => {
    punishmentsService.getSessionPunishment.mockReturnValue({
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.TV,
      rehabilitativeActivities: [],
    })
    return request(app)
      .get(adjudicationUrls.punishment.urls.edit('100', 'xyz'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('data-qa="privilege-radio-buttons"')
      })
  })
})

describe('POST /punishment with multiple privileges switched on', () => {
  it('starts a batch with one item per privilege, in list order, and asks if they share a duration', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeTypes: [PrivilegeType.OTHER, PrivilegeType.CANTEEN],
        otherPrivilege: ' library ',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentSameDuration.urls.start('100'))
      .then(() =>
        expect(punishmentsService.startPunishmentBatch).toHaveBeenCalledWith(expect.anything(), '100', [
          { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN },
          { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'library' },
        ]),
      )
  })

  it('will not add a privilege again from a form that still offers it', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN, rehabilitativeActivities: [] },
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'library',
        rehabilitativeActivities: [],
      },
    ])
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeTypes: [PrivilegeType.TV, PrivilegeType.CANTEEN],
      })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Loss of canteen has already been added. Select a different privilege')
        expect(res.text).not.toContain('value="CANTEEN"')
        expect(punishmentsService.startPunishmentBatch).not.toHaveBeenCalled()
      })
  })

  it('still allows another Other privilege', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'library',
        rehabilitativeActivities: [],
      },
    ])
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeTypes: PrivilegeType.OTHER, otherPrivilege: 'gym' })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentDuration.urls.start('100'))
  })

  describe('changing a punishment', () => {
    beforeEach(() =>
      punishmentsService.getAllSessionPunishments.mockReturnValue([
        {
          redisId: 'canteen',
          type: PunishmentType.PRIVILEGE,
          privilegeType: PrivilegeType.CANTEEN,
          rehabilitativeActivities: [],
        },
        {
          redisId: 'tv',
          type: PunishmentType.PRIVILEGE,
          privilegeType: PrivilegeType.TV,
          rehabilitativeActivities: [],
        },
      ]),
    )

    it('will not change it to a privilege another punishment already withdraws', () =>
      request(app)
        .post(adjudicationUrls.punishment.urls.edit('100', 'canteen'))
        .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.TV })
        .expect(200)
        .expect(res => expect(res.text).toContain('Loss of TV has already been added. Select a different privilege')))

    it('keeps its own privilege', () =>
      request(app)
        .post(adjudicationUrls.punishment.urls.edit('100', 'tv'))
        .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.TV })
        .expect(302)
        .expect('Location', /^\/punishment-duration\/100\/edit\/tv/))

    it('is not checked where the prison is not switched on', () => {
      config.featureToggles.multiPrivilegePunishmentsPrisons = ['LEI']
      return request(app)
        .post(adjudicationUrls.punishment.urls.edit('100', 'canteen'))
        .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.TV })
        .expect(302)
    })
  })

  it('goes straight to the duration page for one privilege', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeTypes: PrivilegeType.TV })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentDuration.urls.start('100'))
  })

  it.each([
    [{ punishmentType: PunishmentType.CONFINEMENT }, { type: PunishmentType.CONFINEMENT }],
    [
      { punishmentType: PunishmentType.EARNINGS, stoppagePercentage: '20' },
      { type: PunishmentType.EARNINGS, stoppagePercentage: 20 },
    ],
    [
      { punishmentType: PunishmentType.LOSS_OF_SOCIAL_VISITS, lossHasChildUnder18: 'true' },
      { type: PunishmentType.LOSS_OF_SOCIAL_VISITS, hasChildUnder18: true },
    ],
  ])('sends a day-based punishment to the duration page as a batch of one: %o', (body, item) => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send(body)
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentDuration.urls.start('100'))
      .then(() =>
        expect(punishmentsService.startPunishmentBatch).toHaveBeenCalledWith(expect.anything(), '100', [item]),
      )
  })

  it('keeps payback punishment on its own journey', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType: PunishmentType.PAYBACK })
      .expect(302)
      .expect('Location', /payback-punishment-specifics/)
      .then(() => expect(punishmentsService.startPunishmentBatch).not.toHaveBeenCalled())
  })

  it('asks for a privilege when none is ticked', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType: PunishmentType.PRIVILEGE })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select which privileges will be withdrawn')
        expect(res.text).toContain('href="#privilegeTypes"')
      })
  })

  it('asks for the other privilege when Other is ticked without one', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeTypes: [PrivilegeType.TV, PrivilegeType.OTHER] })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Enter a privilege to be withdrawn')
        expect(res.text).toMatch(/value="TV" checked/)
      })
  })

  it('Save and exit returns to the award punishments page without checking the answers', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.start('100'))
      .send({ action: 'exit' })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() => expect(punishmentsService.startPunishmentBatch).not.toHaveBeenCalled())
  })

  it('Save and exit leaves a change without checking the answers', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.edit('100', 'xyz'))
      .send({ action: 'exit' })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })

  it('sends a change to a day-based punishment through the duration page', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.edit('100', 'xyz'))
      .send({ punishmentType: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'gym' })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz')}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=gym`,
      )
  })
})
