import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentReasonForChange } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getReasonForChangePunishments.mockResolvedValue({
    reasonForChange: PunishmentReasonForChange.CORRECTION,
    detailsOfChange: 'This is a reason for the change',
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
      .get(adjudicationUrls.reasonForChangePunishment.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET ', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForChangePunishment.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for this change?')
      })
      .then(() =>
        expect(punishmentsService.getReasonForChangePunishments).toHaveBeenCalledWith(expect.anything(), '100'),
      )
  })
})

describe('POST', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(adjudicationUrls.reasonForChangePunishment.urls.edit('100'))
      .send({
        reasonForChange: PunishmentReasonForChange.OTHER,
        detailsOfChange: 'This is a reason for the change',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.checkPunishments.urls.submittedEdit('100')}?punishmentsChanged=true`)
      .then(() =>
        expect(punishmentsService.setReasonForChangePunishments).toHaveBeenCalledWith(
          expect.anything(),
          {
            reasonForChange: PunishmentReasonForChange.OTHER,
            detailsOfChange: 'This is a reason for the change',
          },
          '100',
        ),
      )
  })
})
