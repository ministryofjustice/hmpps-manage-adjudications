import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import TestData from '../../testutils/testData'

jest.mock('../../../services/reportedAdjudicationsService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe.skip('GET hearing details', () => {
  it('should load the hearing details page - reporter version - no hearings', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValueOnce({
      reportedAdjudication: testData.reportedAdjudication({
        adjudicationNumber: 1524493,
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-12-09T10:30:00',
        locationId: 197682,
      }),
    })
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report(1524493))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(response.text).toContain(
          'You can only schedule a hearing for reports that have been reviewed and accepted.'
        )
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
      })
  })
  it('should load the hearing details page - reporter version - one hearing', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValueOnce({
      reportedAdjudication: testData.reportedAdjudication({
        adjudicationNumber: 1524494,
        prisonerNumber: 'G6415GD',
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        status: ReportedAdjudicationStatus.SCHEDULED,
        hearings: [
          testData.singleHearing({
            dateTimeOfHearing: '2022-10-24T12:54:09.197Z',
          }),
        ],
      }),
    })
    reportedAdjudicationsService.getHearingDetails.mockResolvedValue([
      {
        id: 101,
        dateTime: {
          label: 'Date and time of hearing',
          value: '24 October 2022 - 12:54',
        },
        location: {
          label: 'Location',
          value: 'Adj 2',
        },
      },
    ])
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report(1524494))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledWith(
          1524494,
          expect.anything()
        )
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledWith(
          [
            testData.singleHearing({
              dateTimeOfHearing: '2022-10-24T12:54:09.197Z',
            }),
          ],
          expect.anything()
        )
        expect(response.text).toContain('Hearing 1')
      })
  })
})
