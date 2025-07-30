import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import PunishmentsService from '../../../services/punishmentsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'
import { HearingOutcomeCode, HearingOutcomeFinding, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/punishmentsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    hearing: testData.singleHearing({
      dateTimeOfHearing: '2023-01-23T17:00:00',
      id: 1,
      locationId: 775,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
      }),
    }),
  })
  reportedAdjudicationsService.getTransferBannerInfo.mockResolvedValue({
    transferBannerContent: null,
    originatingAgencyToAddOutcome: false,
  })
  punishmentsService.formatPunishmentComments.mockResolvedValue([
    // @ts-expect-error: TS doesn't get that the reason for change isn't always present
    {
      id: 1,
      comment: 'punishment comment text',
      date: '1 January 2023',
      time: '06:00',
      name: 'J. Smith',
      changeLink: '',
      removeLink: '',
      isOwner: true,
    },
  ])
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, punishmentsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET Punishments and damages tab', () => {
  it('should show punishment comments', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '1524493',
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-12-09T10:30:00',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        punishments: [testData.punishmentWithSchedule({})],
        punishmentComments: [testData.singlePunishmentComment({})],
      }),
    })
    return request(app)
      .get(adjudicationUrls.punishmentsAndDamages.urls.report('12345'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Punishments')
        expect(response.text).toContain('Punishment comments')
        expect(response.text).toContain('1 January 2023')
        expect(response.text).toContain('J. Smith')
        expect(response.text).toContain('06:00')
        expect(response.text).toContain('punishment comment text')
        expect(response.text).not.toContain('Add comment')
        expect(punishmentsService.getPunishmentsFromServer).toHaveBeenCalledTimes(1)
      })
  })

  it('should show punishment comments even if no punishment added', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '1524493',
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-12-09T10:30:00',
        status: ReportedAdjudicationStatus.QUASHED,
        punishments: null,
        punishmentComments: [testData.singlePunishmentComment({})],
      }),
    })
    return request(app)
      .get(adjudicationUrls.punishmentsAndDamages.urls.report('12345'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Punishment comments')
        expect(response.text).toContain('1 January 2023')
        expect(response.text).toContain('J. Smith')
        expect(response.text).toContain('06:00')
        expect(response.text).toContain('punishment comment text')
        expect(response.text).not.toContain('Add comment')
        expect(punishmentsService.getPunishmentsFromServer).toHaveBeenCalledTimes(1)
      })
  })
})
