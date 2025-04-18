import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import LocationService from '../../../../services/locationService'
import TestData from '../../../testutils/testData'
import { formatTimestampToDate } from '../../../../utils/utils'
import { AwardedPunishmentsAndDamages, ReportedAdjudicationStatus } from '../../../../data/ReportedAdjudicationResult'
import UserService from '../../../../services/userService'

jest.mock('../../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../../services/locationService.ts')
jest.mock('../../../../services/userService.ts')

const locationService = new LocationService(null) as jest.Mocked<LocationService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>
const testData = new TestData() as jest.Mocked<TestData>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { locationService, reportedAdjudicationsService })

  const awardedPunishmentsAndDamages: AwardedPunishmentsAndDamages[] = [
    {
      chargeNumber: '12345',
      nameAndNumber: 'Smith, James G7234VB',
      prisonerLocation: 'A-2-001',
      formattedDateTimeOfHearing: formatTimestampToDate('2022-11-23T17:00:00', 'D MMMM YYYY - HH:mm'),
      status: ReportedAdjudicationStatus.CHARGE_PROVED,
      caution: 'Yes',
      punishmentCount: 3,
      financialPunishmentCount: 3,
      damagesOwedAmount: '£200',
      additionalDays: 0,
      prospectiveAdditionalDays: 0,
      reportHref: { link: adjudicationUrls.punishmentsAndDamages.urls.review('12345'), text: 'View punishments' },
    },
    {
      chargeNumber: '12345',
      nameAndNumber: 'Tovey, Peter G6123VU',
      prisonerLocation: 'A-2-001',
      formattedDateTimeOfHearing: formatTimestampToDate('2022-11-23T17:00:00', 'D MMMM YYYY - HH:mm'),
      status: ReportedAdjudicationStatus.CHARGE_PROVED,
      caution: 'No',
      financialPunishmentCount: 0,
      punishmentCount: 0,
      additionalDays: 0,
      prospectiveAdditionalDays: 0,
      reportHref: { link: adjudicationUrls.punishmentsAndDamages.urls.review('12345'), text: 'View punishments' },
    },
  ]
  reportedAdjudicationsService.getAwardedPunishmentsAndDamages.mockResolvedValue(awardedPunishmentsAndDamages as never)

  const locations = testData.residentialLocations()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locationService.getLocationsForUser.mockResolvedValue(locations as any)
  userService.isUserALO.mockResolvedValue(true)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /awarded-punishments-and-damages/financial', () => {
  describe('with results', () => {
    it('should load awarded punishments and damages - no filter', () => {
      return request(app)
        .get(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('View hearing outcomes')
          expect(response.text).toContain('Smith, James G7234VB')
        })
    })
    it('should load awarded punishments and damages - with filter', () => {
      return request(app)
        .get(
          adjudicationUrls.awardedPunishmentsAndDamages.urls.financialFilter({
            hearingDate: '04/12/2022',
            locationId: '722174',
          })
        )
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('View hearing outcomes')
          expect(response.text).toContain('Smith, James G7234VB')
        })
    })
  })

  describe('without results', () => {
    beforeEach(() => {
      reportedAdjudicationsService.getAwardedPunishmentsAndDamages.mockResolvedValue([])
    })
    it('shows default message', () => {
      return request(app)
        .get(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('View hearing outcomes')
          expect(response.text).toContain('There are no hearings for this date where a financial punishment was given.')
        })
    })
  })
})

describe('POST /awarded-punishments-and-damages/financial', () => {
  it('should use correct filter parameters from form - without location', () => {
    return request(app)
      .post(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
      .send({ hearingDate: { date: '04/12/2022' }, locationId: null })
      .expect(
        'Location',
        `${adjudicationUrls.awardedPunishmentsAndDamages.urls.financial()}?hearingDate=04%2F12%2F2022&locationId=`
      )
  })
  it('should use correct filter parameters from form - with location', () => {
    return request(app)
      .post(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
      .send({ hearingDate: { date: '04/12/2022' }, locationId: 722174 })
      .expect(
        'Location',
        `${adjudicationUrls.awardedPunishmentsAndDamages.urls.financial()}?hearingDate=04%2F12%2F2022&locationId=722174`
      )
  })
})
