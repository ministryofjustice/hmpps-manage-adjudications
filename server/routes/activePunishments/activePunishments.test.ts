import { Express } from 'express'
import request from 'supertest'
import { PrisonerAdjudicationsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import PunishmentsService from '../../services/punishmentsService'
import { PunishmentMeasurement, PunishmentType } from '../../data/PunishmentResult'
import mockPermissions from '../testutils/mockPermissions'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/punishmentsService.ts')
jest.mock('@ministryofjustice/hmpps-prison-permissions-lib', () => ({
  ...jest.requireActual('@ministryofjustice/hmpps-prison-permissions-lib'),
  isGranted: jest.fn(),
  prisonerPermissionsGuard: jest.fn(),
}))

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  mockPermissions({ [PrisonerAdjudicationsPermission.read]: true })
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, punishmentsService })

  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G7234VB',
      firstName: 'James',
      lastName: 'Smith',
    }),
  )

  punishmentsService.getActivePunishmentsByOffender.mockResolvedValue([
    {
      chargeNumber: '1',
      punishmentType: PunishmentType.EARNINGS,
      duration: 10,
      measurement: PunishmentMeasurement.DAYS,
      startDate: '2024-01-10',
      lastDay: '2024-01-20',
      stoppagePercentage: 20,
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /active-punishments', () => {
  it('should load the correct details', () => {
    return request(app)
      .get(adjudicationUrls.activePunishments.urls.start('G7234VB'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('James Smith’s active punishments')
      })
  })

  it('should not show punishments when the user may not view the prisoner', () => {
    mockPermissions({ [PrisonerAdjudicationsPermission.read]: false })
    const deniedApp = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, punishmentsService })

    return request(deniedApp)
      .get(adjudicationUrls.activePunishments.urls.start('G7234VB'))
      .expect(403)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(response.text).not.toContain('James Smith')
        expect(punishmentsService.getActivePunishmentsByOffender).not.toHaveBeenCalled()
      })
  })
})
