import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import { checkYourAnswers } from '../../utils/urlGenerator'

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
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/104')
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
            `<a href='${checkYourAnswers.urls.start(
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
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/104')
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
            `<a href='${checkYourAnswers.urls.start(
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
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/104')
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
            `<a href='${checkYourAnswers.urls.start(
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
      })
    })
    it('should load the continue report page', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/104')
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
            `<a href='${checkYourAnswers.urls.start(
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
      })
    })
    it('should not contain a link to confirm the adjudication', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/104')
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
            `<a href='${checkYourAnswers.urls.start(
              104
            )}' class='task' data-qa='accept-details-link'>Accept details and place on report</a></td>`
          )
        })
    })
  })
})
