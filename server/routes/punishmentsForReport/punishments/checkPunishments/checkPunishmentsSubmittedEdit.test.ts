import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentData, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

const punishmentsOnSession: PunishmentData[] = [
  {
    rehabilitativeActivities: [],
    redisId: 'qwerty-123',
    type: PunishmentType.CONFINEMENT,
    duration: 5,
    startDate: '2023-04-20',
    endDate: '2023-04-25',
  },
  {
    rehabilitativeActivities: [],
    redisId: 'asdfg-123-erty',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.FACILITIES,
    duration: 10,
    startDate: '2023-04-10',
    endDate: '2023-04-20',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getAllSessionPunishments.mockResolvedValue(punishmentsOnSession)
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
      .get(adjudicationUrls.checkPunishments.urls.submittedEdit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(adjudicationUrls.checkPunishments.urls.submittedEdit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers before submitting')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint', () => {
    return request(app)
      .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}`)
      .send()
      .then(() =>
        expect(punishmentsService.editPunishmentSet).toHaveBeenCalledWith(
          punishmentsOnSession,
          '100',
          expect.anything(),
        ),
      )
  })
  it('should redirect after submission', () => {
    return request(app)
      .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}`)
      .send()
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review('100'))
  })
})

describe('API validation failures', () => {
  const validationMessage =
    'charge 100 cannot be consecutive to LGI-011290 because it would create a consecutive punishment loop'

  it('keeps the entered punishments and shows an actionable error instead of a service failure', async () => {
    punishmentsService.editPunishmentSet.mockRejectedValue({
      status: 400,
      data: { userMessage: `Validation failure: ${validationMessage}` },
    })
    punishmentsService.filteredPunishments.mockResolvedValue({
      damages: [],
      otherPunishments: punishmentsOnSession,
    })

    const response = await request(app).post(adjudicationUrls.checkPunishments.urls.submittedEdit('100')).expect(200)

    expect(response.text).toContain(validationMessage)
    expect(response.text).toContain('href="#change-punishments"')
    expect(response.text).toContain('id="change-punishments"')
    expect(response.text).toContain(adjudicationUrls.awardPunishments.urls.modified('100'))
    expect(response.text).toContain('10 days')
    expect(response.text).not.toContain('Sorry, there is a problem with the service')
    expect(punishmentsService.createReasonForChangingPunishmentComment).not.toHaveBeenCalled()
  })

  it.each([{ status: 500, data: { userMessage: 'Unavailable' } }, { status: 400 }])(
    'keeps unexpected errors on the service error path: %j',
    async error => {
      punishmentsService.editPunishmentSet.mockRejectedValue(error)
      await request(app).post(adjudicationUrls.checkPunishments.urls.submittedEdit('100')).expect(error.status)
    },
  )
})

it('preserves the reason for change and does not save a comment when changed punishments are rejected', async () => {
  punishmentsService.getReasonForChangePunishments.mockReturnValue({
    reasonForChange: 'OTHER',
    detailsOfChange: 'Correct the consecutive target',
  })
  punishmentsService.editPunishmentSet.mockRejectedValue({
    status: 400,
    data: { userMessage: 'Validation failure: consecutive punishment loop' },
  })

  const response = await request(app)
    .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}?punishmentsChanged=true`)
    .expect(200)

  expect(response.text).toContain('consecutive punishment loop')
  expect(response.text).toContain('Correct the consecutive target')
  expect(punishmentsService.createReasonForChangingPunishmentComment).not.toHaveBeenCalled()
})

it('saves the reason for change only after the punishments have been accepted', async () => {
  punishmentsService.getReasonForChangePunishments.mockReturnValue({
    reasonForChange: 'OTHER',
    detailsOfChange: 'Correct the consecutive target',
  })

  await request(app)
    .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}?punishmentsChanged=true`)
    .expect(302)
    .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review('100'))

  expect(punishmentsService.createReasonForChangingPunishmentComment).toHaveBeenCalledWith(
    '100',
    'Correct the consecutive target',
    'OTHER',
    expect.anything(),
  )
  expect(punishmentsService.editPunishmentSet.mock.invocationCallOrder[0]).toBeLessThan(
    punishmentsService.createReasonForChangingPunishmentComment.mock.invocationCallOrder[0],
  )
})

it('does not present a comment failure as a rejected punishment after the punishment has been saved', async () => {
  punishmentsService.getReasonForChangePunishments.mockReturnValue({
    reasonForChange: 'OTHER',
    detailsOfChange: 'Reason',
  })
  punishmentsService.createReasonForChangingPunishmentComment.mockRejectedValue({
    status: 400,
    data: { userMessage: 'Validation failure: comment rejected' },
  })

  const response = await request(app)
    .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}?punishmentsChanged=true`)
    .expect(400)

  expect(punishmentsService.editPunishmentSet).toHaveBeenCalledTimes(1)
  expect(response.text).not.toContain('data-qa="error-summary"')
})

it('shows the competing-dependent error from the recording while retaining all four ADA rows', async () => {
  const punishments: PunishmentData[] = ['LGI-011101', null, 'LGI-011101', 'LGI-011192'].map(
    (consecutiveChargeNumber, index): PunishmentData => ({
      redisId: `ada-${index}`,
      type: PunishmentType.ADDITIONAL_DAYS,
      duration: 20,
      consecutiveChargeNumber,
      rehabilitativeActivities: [],
    }),
  )
  punishmentsService.getAllSessionPunishments.mockReturnValue(punishments)
  punishmentsService.filteredPunishments.mockResolvedValue({ damages: [], otherPunishments: punishments })
  punishmentsService.getReasonForChangePunishments.mockReturnValue({
    reasonForChange: 'OTHER',
    detailsOfChange: 'Correct the consecutive target',
  })
  const message =
    'Unable to make LGI-011206 consecutive to LGI-011101 because LGI-011101 already has a live consecutive ADDITIONAL_DAYS dependent on LGI-011192'
  punishmentsService.editPunishmentSet.mockRejectedValue({
    status: 400,
    data: { userMessage: `Validation failure: ${message}` },
  })

  const response = await request(app)
    .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('LGI-011206')}?punishmentsChanged=true`)
    .expect(200)

  expect(response.text).toContain(message)
  expect(response.text.match(/20 days/g)).toHaveLength(4)
  expect(response.text).toContain('consecutive to charge LGI-011192')
  expect(response.text).toContain(adjudicationUrls.awardPunishments.urls.modified('LGI-011206'))
  expect(punishmentsService.createReasonForChangingPunishmentComment).not.toHaveBeenCalled()
})

it('does not save changed punishments when the reason-for-change session has expired', async () => {
  punishmentsService.getReasonForChangePunishments.mockReturnValue(undefined)

  await request(app)
    .post(`${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}?punishmentsChanged=true`)
    .expect(500)

  expect(punishmentsService.editPunishmentSet).not.toHaveBeenCalled()
})
