import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/allOffencesSessionService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const allOffencesSessionService = new AllOffencesSessionService() as jest.Mocked<AllOffencesSessionService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testDecisionsTree = question([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
])
  .child(
    answer(['Prisoner victim', `Prisoner victim: ${Text.VICTIM_PRISONER_FULL_NAME}`])
      .type(Type.PRISONER)
      .offenceCode(1)
  )
  .child(
    answer('A standard answer with child question').child(
      question('A child question').child(answer('A standard child answer').offenceCode(2))
    )
  )

const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree
)

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G6415GD',
  prisonerNumber: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  physicalAttributes: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const adjudicationAssociatedPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G7824GD',
  prisonerNumber: 'G7824GD',
  firstName: 'ADJUDICATION_ASSOCIATED_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_ASSOCIATED_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  physicalAttributes: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const victimPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G5512G',
  prisonerNumber: 'G5512G',
  firstName: 'A_PRISONER_FIRST_NAME',
  lastName: 'A_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  physicalAttributes: undefined,
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

// All offence data will come from the session
const adjudicationWithoutOffences = {
  draftAdjudication: {
    id: 100,
    adjudicationNumber: 1524493,
    prisonerNumber: adjudicationPrisonerDetails.prisonerNumber,
    gender: PrisonerGender.MALE.toString(),
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    isYouthOffender: false,
    incidentRole: {
      roleCode: '25c',
      associatedPrisonersNumber: adjudicationAssociatedPrisonerDetails.offenderNo,
    },
    startedByUserId: 'TEST_GEN',
  },
}

const youthAdjudicationWithOffences = {
  draftAdjudication: {
    ...adjudicationWithoutOffences.draftAdjudication,
    id: 102,
    isYouthOffender: true,
  },
}

const offencesOnSession: OffenceData[] = [
  {
    offenceCode: '1',
    victimOtherPersonsName: undefined,
    victimPrisonersNumber: 'G5512G',
    victimStaffUsername: undefined,
  },
  {
    offenceCode: '2',
    victimOtherPersonsName: undefined,
    victimPrisonersNumber: undefined,
    victimStaffUsername: undefined,
  },
]

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockImplementation(adjudicationId => {
    switch (adjudicationId) {
      case adjudicationWithoutOffences.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutOffences)
      case youthAdjudicationWithOffences.draftAdjudication.id:
        return Promise.resolve(youthAdjudicationWithOffences)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerDetails.mockImplementation(prisonerNumber => {
    switch (prisonerNumber) {
      case adjudicationPrisonerDetails.prisonerNumber:
        return Promise.resolve(adjudicationPrisonerDetails)
      case adjudicationAssociatedPrisonerDetails.prisonerNumber:
        return Promise.resolve(adjudicationAssociatedPrisonerDetails)
      case victimPrisonerDetails.prisonerNumber:
        return Promise.resolve(victimPrisonerDetails)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerNumberFromDraftAdjudicationNumber.mockResolvedValue('G6415GD')

  placeOnReportService.getOffenceRule.mockImplementation(offenceCode => {
    switch (offenceCode) {
      case 1:
        return Promise.resolve({
          paragraphDescription: 'Offence 1 description',
          paragraphNumber: '21',
        })
      case 2:
        return Promise.resolve({
          paragraphDescription: 'Offence 2 description',
          paragraphNumber: '22',
        })
      default:
        return Promise.resolve(null)
    }
  })

  allOffencesSessionService.getAllSessionOffences.mockReturnValueOnce(offencesOnSession)

  allOffencesSessionService.getAndDeleteAllSessionOffences.mockReturnValueOnce(offencesOnSession)

  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, decisionTreeService, allOffencesSessionService, userService }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence/100 view', () => {
  it('should load the offence details page from the session', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.modified(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        // Title
        expect(res.text).toContain('Offence details')
        // First offence - first question and answer
        expect(res.text).toContain(
          'Assisted: Adjudication_prisoner_first_name Adjudication_prisoner_last_name. Associated: Adjudication_associated_prisoner_first_name Adjudication_associated_prisoner_last_name'
        )
        expect(res.text).toContain('Prisoner victim: A_prisoner_first_name A_prisoner_last_name')
        // Second offence - first question and answer
        expect(res.text).toContain(
          'Assisted: Adjudication_prisoner_first_name Adjudication_prisoner_last_name. Associated: Adjudication_associated_prisoner_first_name Adjudication_associated_prisoner_last_name'
        )
        expect(res.text).toContain('A standard answer with child question')
        // Second offence - second question and answer
        expect(res.text).toContain('A child question')
        expect(res.text).toContain('A standard child answer')
      })
  })

  it('should load the adult offence paragraph information', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.modified(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Prison rule 51')
        expect(res.text).not.toContain('Prison rule 55')
        expect(res.text).toContain('paragraph 21')
        expect(res.text).toContain('paragraph 22')
      })
  })

  it('should get the offence rule related to adults', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.modified(100))
      .expect(200)
      .then(() =>
        expect(placeOnReportService.getOffenceRule).toHaveBeenCalledWith(
          1,
          false,
          PrisonerGender.MALE,
          expect.anything()
        )
      )
      .then(() =>
        expect(placeOnReportService.getOffenceRule).toHaveBeenCalledWith(
          2,
          false,
          PrisonerGender.MALE,
          expect.anything()
        )
      )
  })
})

describe('GET /details-of-offence/102 view', () => {
  it('should load the youth offence paragraph information', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.modified(102))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Prison rule 55')
        expect(res.text).not.toContain('Prison rule 51')
        expect(res.text).toContain('paragraph 21')
        expect(res.text).toContain('paragraph 22')
      })
  })

  it('should get the offence rule related to youth offenders', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.modified(102))
      .expect(200)
      .then(() =>
        expect(placeOnReportService.getOffenceRule).toHaveBeenCalledWith(
          1,
          true,
          PrisonerGender.MALE,
          expect.anything()
        )
      )
      .then(() =>
        expect(placeOnReportService.getOffenceRule).toHaveBeenCalledWith(
          2,
          true,
          PrisonerGender.MALE,
          expect.anything()
        )
      )
  })
})

describe('POST /details-of-offence/100', () => {
  it('should save the offence', async () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.modified(100))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfOffence.urls.modified(100))
          .then(() =>
            expect(placeOnReportService.saveOffenceDetails).toHaveBeenCalledWith(
              100,
              [{ offenceCode: 1, victimPrisonersNumber: 'G5512G' }, { offenceCode: 2 }],
              expect.anything()
            )
          )
      )
  })

  it('should redirect to the damages page if reported adjudication number set', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(100))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfOffence.urls.start(100))
          .send({ reportedAdjudicationNumber: 1524493 })
          .expect(302)
          .expect('Location', adjudicationUrls.detailsOfDamages.urls.start(100))
      )
  })
})

describe('POST /details-of-offence/100 - adding first offence', () => {
  it('should redirect to the incident rule page with resetting-offences flag set - not submitted', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(100))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfOffence.urls.start(100))
          .send({ addFirstOffence: true })
          .expect(302)
          .expect('Location', adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(100))
      )
  })

  it('should redirect to the incident rule page with resetting-offences flag set - submitted', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(100))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfOffence.urls.start(100))
          .send({ reportedAdjudicationNumber: 1524493, addFirstOffence: true })
          .expect(302)
          .expect('Location', adjudicationUrls.ageOfPrisoner.urls.submittedEditWithResettingOffences(100))
      )
  })
})
