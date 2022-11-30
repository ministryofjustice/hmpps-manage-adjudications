import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { WitnessCode, WitnessDetails } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/witnessesSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const witnessesSessionService = new WitnessesSessionService() as jest.Mocked<WitnessesSessionService>

let app: Express

const adjudicationPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G6415GD',
  prisonerNumber: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  physicalAttributes: undefined,
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const adjudicationWithWitnesses = {
  draftAdjudication: {
    id: 100,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    isYouthOffender: false,
    incidentRole: {},
    offenceDetails: [
      {
        offenceCode: 2004,
        offenceRule: {
          paragraphNumber: '3',
          paragraphDescription: 'Detains any person against their will',
        },
        victimOtherPersonsName: 'Jacob Jacobson',
      },
    ],
    startedByUserId: 'TEST_GEN',
    witnesses: [
      {
        code: WitnessCode.OTHER_PERSON,
        firstName: 'Philip',
        reporter: 'NCLAMP_GEN',
        lastName: 'Jones',
      },
      {
        code: WitnessCode.OFFICER,
        firstName: 'Jake',
        reporter: 'NCLAMP_GEN',
        lastName: 'January',
      },
      {
        code: WitnessCode.STAFF,
        firstName: 'Simon',
        reporter: 'NCLAMP_GEN',
        lastName: 'Courtee',
      },
    ],
  },
}

const adjudicationWithoutWitnessesNewNoSave = {
  draftAdjudication: {
    id: 101,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    isYouthOffender: false,
    incidentRole: {},
    offenceDetails: [
      {
        offenceCode: 2004,
        offenceRule: {
          paragraphNumber: '3',
          paragraphDescription: 'Detains any person against their will',
        },
        victimOtherPersonsName: 'Jacob Jacobson',
      },
    ],
    startedByUserId: 'TEST_GEN',
  },
}

const adjudicationWithoutWitnessesSaved = {
  draftAdjudication: {
    id: 102,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    isYouthOffender: false,
    incidentRole: {},
    offenceDetails: [
      {
        offenceCode: 2004,
        offenceRule: {
          paragraphNumber: '3',
          paragraphDescription: 'Detains any person against their will',
        },
        victimOtherPersonsName: 'Jacob Jacobson',
      },
    ],
    startedByUserId: 'TEST_GEN',
    witnessesSaved: true,
    witnesses: [] as WitnessDetails[],
  },
}

beforeEach(() => {
  // placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithWitnesses)
  placeOnReportService.getDraftAdjudicationDetails.mockImplementation(adjudicationId => {
    switch (adjudicationId) {
      case adjudicationWithWitnesses.draftAdjudication.id:
        return Promise.resolve(adjudicationWithWitnesses)
      case adjudicationWithoutWitnessesNewNoSave.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutWitnessesNewNoSave)
      case adjudicationWithoutWitnessesSaved.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutWitnessesSaved)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  placeOnReportService.saveWitnessDetails.mockResolvedValue(adjudicationWithoutWitnessesSaved)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, witnessesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Courtee, Simon')
        expect(res.text).toContain('January, Jake')
        expect(res.text).toContain('Prison officer')
      })
  })
  it('should not have used the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.start(100))
      .expect(200)
      .then(() =>
        expect(witnessesSessionService.setAllSessionWitnesses).toHaveBeenCalledWith(
          expect.anything(),
          [
            {
              code: WitnessCode.OTHER_PERSON,
              firstName: 'Philip',
              reporter: 'NCLAMP_GEN',
              lastName: 'Jones',
            },
            {
              code: WitnessCode.OFFICER,
              firstName: 'Jake',
              reporter: 'NCLAMP_GEN',
              lastName: 'January',
            },
            {
              code: WitnessCode.STAFF,
              firstName: 'Simon',
              reporter: 'NCLAMP_GEN',
              lastName: 'Courtee',
            },
          ],
          100
        )
      )
      .then(() => expect(witnessesSessionService.getAllSessionWitnesses).not.toHaveBeenCalled())
  })
})
describe('POST', () => {
  it('should save the witnesses if it is the first time calling the endpoint (even if list is empty)', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfWitnesses.urls.start(101))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfWitnesses.urls.start(101))
          .then(() => expect(placeOnReportService.saveWitnessDetails).toHaveBeenCalledWith(101, [], expect.anything()))
      )
  })
  it('should not save the witnesses if it is the not first time calling the endpoint and no changes have been made', () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfWitnesses.urls.start(102))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfWitnesses.urls.start(102))
          .then(() => expect(placeOnReportService.saveWitnessDetails).not.toHaveBeenCalled())
      )
  })
})
