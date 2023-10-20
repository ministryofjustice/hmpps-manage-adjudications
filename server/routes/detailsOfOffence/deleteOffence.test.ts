import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null, null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testDecisionsTree = question([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
]).child(
  answer(['Prisoner victim', `Prisoner victim: ${Text.VICTIM_PRISONER_FULL_NAME}`])
    .type(Type.PRISONER)
    .offenceCode(1)
)
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree,
  null,
  null,
  null,
  null,
  null,
  null
)
let app: Express

const prisonerData = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'A_PRISONER_FIRST_NAME',
  lastName: 'A_PRISONER_LAST_NAME',
})

const offenceData = {
  victimOtherPersonsName: '',
  victimPrisonersNumber: 'G5512G',
  victimStaffUsername: '',
  offenceCode: `1`,
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 102,
      chargeNumber: '1524493',
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
      offenceDetails: {
        offenceCode: 1,
        victimPrisonersNumber: 'G5512G',
      },
    }),
  })

  placeOnReportService.getPrisonerDetails.mockResolvedValue(prisonerData)

  placeOnReportService.getOffencePrisonerDetails.mockResolvedValue({
    prisoner: prisonerData,
    associatedPrisoner: undefined,
  })
  app = appWithAllRoutes({ production: false }, { placeOnReportService, decisionTreeService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence/102/delete view', () => {
  it('should show the offence to delete', async () => {
    const agent = request.agent(app)
    return agent.get(adjudicationUrls.detailsOfOffence.urls.start(102)).then(() =>
      // This call will populate the session, which we need for the delete page.
      agent
        .get(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData))
        .expect(200)
        // Title
        .expect(res => {
          expect(res.text).toContain('Do you want to remove this offence?')
          expect(res.text).toContain('Committed: A_prisoner_first_name A_prisoner_last_name')
          expect(res.text).toContain('Prisoner victim: A_prisoner_first_name A_prisoner_last_name')
        })
    )
  })
})

describe('POST /details-of-offence/102/delete validation', () => {
  it('should show the offence to delete', async () => {
    const agent = request.agent(app)
    return agent.get(adjudicationUrls.detailsOfOffence.urls.start(102)).then(() =>
      // This call will populate the session, which we need for the delete page.
      agent
        .get(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData))
        .expect(200)
        .then(() =>
          agent.post(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData)).expect(res => {
            expect(res.text).toContain('Select yes if you want to remove this offence')
          })
        )
    )
  })
})

describe('POST /details-of-offence/102/delete/1', () => {
  it('should remove the offence when selecting yes', async () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(102)) // This call will populate the session, which we need for the delete page.
      .expect(res => expect(res.text).toContain('Committed: A_prisoner_first_name A_prisoner_last_name'))
      .then(() =>
        agent.get(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData)).then(() =>
          agent
            .post(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData))
            .send({ confirmDelete: 'yes' })
            .expect(302)
            .expect('Location', adjudicationUrls.detailsOfOffence.urls.modified(102))
            .then(() =>
              agent
                .get(adjudicationUrls.detailsOfOffence.urls.modified(102))
                .expect(200)
                // The offence with this answer should be removed
                .expect(res => expect(res.text).toContain('This report does not currently have any offence details.'))
            )
        )
      )
  })

  it('should remove not remove the offence when selecting no', async () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(102)) // This call will populate the session, which we need for the delete page.
      .expect(res => expect(res.text).toContain('Committed: A_prisoner_first_name A_prisoner_last_name')) // We will decide not to delete the offence with this answer
      .then(() =>
        agent.get(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData)).then(() =>
          agent
            .post(adjudicationUrls.detailsOfOffence.urls.delete(102, offenceData))
            .send({ confirmDelete: 'no' })
            .expect(302)
            .expect(
              'Location',
              `${adjudicationUrls.detailsOfOffence.urls.modified(
                102
              )}?offenceCode=1&victimOtherPersonsName=&victimPrisonersNumber=G5512G&victimStaffUsername=`
            )
        )
      )
  })
})
