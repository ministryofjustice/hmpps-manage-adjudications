import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import PunishmentsService from '../../services/punishmentsService'
import { PunishmentMeasurement, PunishmentType } from '../../data/PunishmentResult'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/punishmentsService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, punishmentsService })

  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G7234VB',
      firstName: 'James',
      lastName: 'Smith',
    })
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
})
