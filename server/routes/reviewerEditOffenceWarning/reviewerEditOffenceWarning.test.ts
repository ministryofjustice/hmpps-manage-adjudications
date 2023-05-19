import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import UserService from '../../services/userService'
import { PrisonerResultSummary } from '../../services/placeOnReportService'

jest.mock('../../services/decisionTreeService')
jest.mock('../../services/reportedAdjudicationsService')
jest.mock('../../services/userService')

const testData = new TestData()
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
})

const adjudicationAssociatedPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G7824GD',
  firstName: 'ADJUDICATION_ASSOCIATED_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_ASSOCIATED_PRISONER_LAST_NAME',
})

const victimPrisonerDetails: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G5512G',
  firstName: 'A_PRISONER_FIRST_NAME',
  lastName: 'A_PRISONER_LAST_NAME',
})

const reportedAdj = {
  reportedAdjudication: testData.reportedAdjudication({
    adjudicationNumber: 100,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    dateTimeOfIncident: '2022-12-09T10:30:00',
    incidentRole: {
      roleCode: '25c',
      associatedPrisonersNumber: adjudicationAssociatedPrisonerDetails.offenderNo,
    },
    offenceDetails: {
      offenceCode: 1,
      victimPrisonersNumber: victimPrisonerDetails.offenderNo,
    },
  }),
}

const qAndAs = [
  {
    question: 'What type of offence did Bobby Da Smith Jones commit?',
    answer: 'Assault, fighting, or endangering the health or personal safety of others',
  },
  {
    question: 'What did the incident involve?',
    answer: 'Assaulting someone',
  },
  {
    question: 'Who was assaulted?',
    answer: 'Another prisoner - John Saunders',
  },
  {
    question: 'Was the incident a racially aggravated assault?',
    answer: 'No',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { decisionTreeService, reportedAdjudicationsService, userService })
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.createDraftFromCompleteAdjudication.mockResolvedValue(1000)
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue(reportedAdj)
  decisionTreeService.reportedAdjudicationIncidentData.mockResolvedValue({
    reportedAdjudication: reportedAdj.reportedAdjudication,
    prisoner: adjudicationPrisonerDetails,
    associatedPrisoner: adjudicationAssociatedPrisonerDetails,
    incidentRole: reportedAdj.reportedAdjudication.incidentRole,
  })
  decisionTreeService.getAdjudicationOffences.mockResolvedValue({
    questionsAndAnswers: qAndAs,
    incidentRule: undefined,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET - not reviewer', () => {
  beforeEach(() => {
    app = appWithAllRoutes(
      { production: false },
      { decisionTreeService, reportedAdjudicationsService, userService },
      {}
    )
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(100)}?days=10`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the age of prisoner page', () => {
    return request(app)
      .get(adjudicationUrls.reviewerEditOffenceWarning.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Are you sure you want to change the offence?')
        expect(res.text).toContain('Another prisoner - John Saunders')
        expect(res.text).toContain('Prison rule 51, paragraph 1')
      })
  })
})
