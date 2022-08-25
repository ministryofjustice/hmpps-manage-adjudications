import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { WitnessCode } from '../../data/DraftAdjudicationResult'

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
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
  dateOfBirth: undefined,
}

const adjudicationWithoutWitnesses = {
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
  },
}

const witnessesOnSession = [
  {
    code: WitnessCode.OTHER,
    firstName: 'Philip',
    reporter: 'NCLAMP_GEN',
    lastName: 'Jones',
  },
  {
    code: WitnessCode.PRISON_OFFICER,
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
]

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithoutWitnesses)
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)
  app = appWithAllRoutes({ production: false }, { placeOnReportService, witnessesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    witnessesSessionService.getAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    witnessesSessionService.getAndDeleteAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    app = appWithAllRoutes({ production: false }, { placeOnReportService, witnessesSessionService })
  })
  it('should load the page with details from the session', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Prison officer')
        expect(res.text).toContain('January, Jake')
      })
  })
  it('should use the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect(200)
      .then(() => expect(witnessesSessionService.setAllSessionWitnesses).not.toHaveBeenCalled())
      .then(() => expect(witnessesSessionService.getAllSessionWitnesses).toHaveBeenCalledWith(expect.anything(), 100))
  })
})

describe('POST', () => {
  it('should call the save endpoint with evidence present', () => {
    witnessesSessionService.getAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    witnessesSessionService.getAndDeleteAllSessionWitnesses.mockReturnValueOnce(witnessesOnSession)
    return request(app)
      .post(adjudicationUrls.detailsOfWitnesses.urls.modified(100))
      .expect(302)
      .then(() =>
        expect(placeOnReportService.saveWitnessDetails).toHaveBeenCalledWith(100, witnessesOnSession, expect.anything())
      )
  })
})
