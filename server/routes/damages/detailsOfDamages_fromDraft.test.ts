import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DamageCode } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/damagesSessionService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const damagesSessionService = new DamagesSessionService() as jest.Mocked<DamagesSessionService>

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

const adjudicationWithDamages = {
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
    damages: [
      {
        code: DamageCode.REDECORATION,
        details: 'Broken window',
        reporter: 'TESTER_GEN',
      },
      {
        code: DamageCode.REDECORATION,
        details: 'Broken pool cue',
        reporter: 'TESTER_GEN',
      },
    ],
  },
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue(adjudicationWithDamages)

  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(adjudicationPrisonerDetails)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, damagesSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /damages/100', () => {
  it('should load the damages page', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Redecoration')
        expect(res.text).toContain('Broken window')
        expect(res.text).toContain('Broken pool cue')
      })
  })
  it('should not have used the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfDamages.urls.start(100))
      .expect(200)
      .then(() =>
        expect(damagesSessionService.setAllSessionDamages).toHaveBeenCalledWith(
          expect.anything(),
          [
            {
              type: DamageCode.REDECORATION,
              description: 'Broken window',
              reporter: 'TESTER_GEN',
            },
            {
              type: DamageCode.REDECORATION,
              description: 'Broken pool cue',
              reporter: 'TESTER_GEN',
            },
          ],
          100
        )
      )
      .then(() => expect(damagesSessionService.getAllSessionDamages).not.toHaveBeenCalled())
  })
})
