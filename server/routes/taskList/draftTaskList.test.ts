import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
      assignedLivingUnitDesc: '4-2-001',
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /place-the-prisoner-on-report', () => {
  beforeEach(() => {
    placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
      handoverDeadline: '2021-11-23T00:00:00',
      offenceDetailsStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
      showLinkForAcceptDetails: false,
      offenceDetailsUrl: '',
      incidentStatementStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      damagesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      evidenceStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
    })
  })
  it('should load the continue report page', () => {
    return request(app)
      .get(adjudicationUrls.taskList.urls.start('3456'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Incident details')
        expect(response.text).toContain('COMPLETED')
        expect(response.text).toContain('Offence details')
        expect(response.text).toContain('COMPLETED')
        expect(response.text).toContain('Damages')
        expect(response.text).toContain('NOT STARTED')
        expect(response.text).toContain('Evidence')
        expect(response.text).toContain('NOT STARTED')
        expect(response.text).toContain('Witnesses')
        expect(response.text).toContain('NOT STARTED')
        expect(response.text).toContain('Incident statement')
        expect(response.text).toContain('NOT STARTED')
        expect(response.text).toContain('Accept details and place on report')
        expect(response.text).toContain('NOT STARTED')
        expect(response.text).toContain(
          'You need to provide Udfsanaye Aidetria with a printed copy of this report by 00:00 on 23 November 2021.'
        )
        expect(response.text).not.toContain(
          `<a href='${adjudicationUrls.checkYourAnswers.urls.start(
            104
          )}' class='task' data-qa='accept-details-link'>Accept details and place on report</a></td>`
        )
      })
  })
})
