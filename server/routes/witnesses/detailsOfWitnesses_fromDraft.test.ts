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
    ],
  },
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithWitnesses)

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

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
          ],
          100
        )
      )
      .then(() => expect(witnessesSessionService.getAllSessionWitnesses).not.toHaveBeenCalled())
  })
})
