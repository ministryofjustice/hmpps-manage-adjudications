import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    dateOfBirth: undefined,
    categoryCode: undefined,
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /place-the-prisoner-on-report', () => {
  describe('Only incident details completed', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T00:00:00',
        statementPresent: false,
        statementComplete: false,
        offenceDetailsComplete: false,
        showLinkForAcceptDetails: false,
        taskListDisplay: [
          {
            id: 'incident-details-info',
            linkUrl: '/incident-details/G6415GD/104/edit',
            linkAttributes: 'incident-details-link',

            linkText: 'Incident details',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'offence-details-info',
            linkUrl: '/age-of-prisoner/104',
            linkAttributes: 'details-of-offence-link',

            linkText: 'Offence details',
            statusClass: 'govuk-tag',
            statusText: 'NOT STARTED',
          },
          {
            id: 'incident-statement-info',
            linkUrl: '/incident-statement/104',
            linkAttributes: 'incident-statement-link',

            linkText: 'Incident statement',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
          {
            id: 'accept-details-info',
            linkUrl: '/check-your-answers/104',
            linkAttributes: 'accept-details-link',

            linkText: 'Accept details and place on report',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
        ],
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.taskList.urls.start(104))
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Offence details')
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
  describe('Offence details completed', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T00:00:00',
        statementPresent: false,
        statementComplete: false,
        offenceDetailsComplete: true,
        showLinkForAcceptDetails: false,
        taskListDisplay: [
          {
            id: 'incident-details-info',
            linkUrl: '/incident-details/G6415GD/104/edit',
            linkAttributes: 'incident-details-link',

            linkText: 'Incident details',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'offence-details-info',
            linkUrl: '/details-of-offence/104',
            linkAttributes: 'details-of-offence-link',

            linkText: 'Offence details',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'COMPLETED',
          },
          {
            id: 'incident-statement-info',
            linkUrl: '/incident-statement/104',
            linkAttributes: 'incident-statement-link',

            linkText: 'Incident statement',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
          {
            id: 'accept-details-info',
            linkUrl: '/check-your-answers/104',
            linkAttributes: 'accept-details-link',

            linkText: 'Accept details and place on report',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
        ],
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.taskList.urls.start(3456))
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Offence details')
          expect(response.text).toContain('COMPLETED')
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
  describe('Statement started', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T20:45:00',
        statementPresent: true,
        statementComplete: false,
        offenceDetailsComplete: true,
        showLinkForAcceptDetails: false,
        taskListDisplay: [
          {
            id: 'incident-details-info',
            linkUrl: '/incident-details/G6123VU/92/edit',
            linkAttributes: 'incident-details-link',

            linkText: 'Incident details',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'offence-details-info',
            linkUrl: '/details-of-offence/92',
            linkAttributes: 'details-of-offence-link',

            linkText: 'Offence details',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'COMPLETED',
          },
          {
            id: 'incident-statement-info',
            linkUrl: '/incident-statement/92',
            linkAttributes: 'incident-statement-link',

            linkText: 'Incident statement',
            statusClass: 'govuk-tag govuk-tag--blue',
            statusText: 'IN PROGRESS',
          },
          {
            id: 'accept-details-info',
            linkUrl: '/check-your-answers/92',
            linkAttributes: 'accept-details-link',

            linkText: 'Accept details and place on report',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
        ],
      })
    })
    it.only('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.taskList.urls.start(3456))
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Offence details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Incident statement')
          expect(response.text).toContain('IN PROGRESS')
          expect(response.text).toContain('Accept details and place on report')
          expect(response.text).toContain('NOT STARTED')
          expect(response.text).toContain(
            'You need to provide Udfsanaye Aidetria with a printed copy of this report by 20:45 on 23 November 2021.'
          )
          expect(response.text).not.toContain(
            `<a href='${adjudicationUrls.checkYourAnswers.urls.start(
              104
            )}' class='task' data-qa='accept-details-link'>Accept details and place on report</a></td>`
          )
        })
    })
  })
  describe('Statement complete', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T15:11:00',
        statementPresent: true,
        statementComplete: true,
        offenceDetailsComplete: true,
        showLinkForAcceptDetails: true,
        taskListDisplay: [
          {
            id: 'incident-details-info',
            linkUrl: '/incident-details/G6415GD/104/edit',
            linkAttributes: 'incident-details-link',

            linkText: 'Incident details',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'offence-details-info',
            linkUrl: '/details-of-offence/104',
            linkAttributes: 'details-of-offence-link',

            linkText: 'Offence details',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'COMPLETED',
          },
          {
            id: 'incident-statement-info',
            linkUrl: '/incident-statement/104',
            linkAttributes: 'incident-statement-link',

            linkText: 'Incident statement',
            statusClass: 'govuk-tag govuk-tag--blue',
            statusText: 'IN PROGRESS',
          },
          {
            id: 'accept-details-info',
            linkUrl: '/check-your-answers/104',
            linkAttributes: 'accept-details-link',
            linkText: 'Accept details and place on report',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
        ],
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(`${adjudicationUrls.taskList.urls.start(104)}`)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Offence details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Incident statement')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Accept details and place on report')
          expect(response.text).toContain('NOT STARTED')
          expect(response.text).toContain(
            'You need to provide Udfsanaye Aidetria with a printed copy of this report by 15:11 on 23 November 2021.'
          )
          expect(response.text).toContain(
            `<a href='${adjudicationUrls.checkYourAnswers.urls.start(
              104
            )}' class='task' data-qa='accept-details-link'>Accept details and place on report</a></td>`
          )
        })
    })
  })
  describe('Incident details and statement complete but not offence details', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T15:11:00',
        statementPresent: true,
        statementComplete: true,
        offenceDetailsComplete: false,
        showLinkForAcceptDetails: false,
        taskListDisplay: [
          {
            id: 'incident-details-info',
            linkUrl: '/incident-details/G6123VU/92/edit',
            linkAttributes: 'incident-details-link',
            linkText: 'Incident details',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'offence-details-info',
            linkUrl: '/details-of-offence/92',
            linkAttributes: 'details-of-offence-link',
            linkText: 'Offence details',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'COMPLETED',
          },
          {
            id: 'incident-statement-info',
            linkUrl: '/incident-statement/92',
            linkAttributes: 'incident-statement-link',

            linkText: 'Incident statement',
            statusClass: 'govuk-tag',
            statusText: 'COMPLETED',
          },
          {
            id: 'accept-details-info',
            linkUrl: '/check-your-answers/92',
            linkAttributes: 'accept-details-link',
            linkText: 'Accept details and place on report',
            statusClass: 'govuk-tag govuk-tag--grey',
            statusText: 'NOT STARTED',
          },
        ],
      })
    })
    it('should not contain a link to confirm the adjudication', () => {
      return request(app)
        .get(adjudicationUrls.taskList.urls.start(3456))
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Offence details')
          expect(response.text).toContain('NOT STARTED')
          expect(response.text).toContain('Incident statement')
          expect(response.text).toContain('COMPLETED')
          expect(response.text).toContain('Accept details and place on report')
          expect(response.text).toContain('NOT STARTED')
          expect(response.text).toContain(
            'You need to provide Udfsanaye Aidetria with a printed copy of this report by 15:11 on 23 November 2021.'
          )
          expect(response.text).not.toContain(
            `<a href='${adjudicationUrls.checkYourAnswers.urls.start(
              104
            )}' class='task' data-qa='accept-details-link'>Accept details and place on report</a></td>`
          )
        })
    })
  })
})
