import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import LocationService from '../../../../services/locationService'
import TestData from '../../../testutils/testData'
import { formatTimestampToDate } from '../../../../utils/utils'
import { AwardedPunishmentsAndDamages, ReportedAdjudicationStatus } from '../../../../data/ReportedAdjudicationResult'

jest.mock('../../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../../services/locationService.ts')

const locationService = new LocationService(null) as jest.Mocked<LocationService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
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
    },
  ]
  reportedAdjudicationsService.getAwardedPunishmentsAndDamages.mockResolvedValue(awardedPunishmentsAndDamages as never)

  const locations = testData.residentialLocations()
  locationService.getLocationsForUser.mockResolvedValue(locations)
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
          expect(response.text).toContain('Awarded punishments and damages')
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
          expect(response.text).toContain('Awarded punishments and damages')
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
          expect(response.text).toContain('Awarded punishments and damages')
          expect(response.text).toContain('No scheduled hearings')
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