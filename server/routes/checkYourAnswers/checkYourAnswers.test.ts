import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'
import { properCase } from '../../utils/utils'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/decisionTreeService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>

let app: Express

beforeEach(() => {
  decisionTreeService.draftAdjudicationIncidentData.mockResolvedValue({
    draftAdjudication: {
      id: 100,
      prisonerNumber: 'G6415GD',
      gender: PrisonerGender.FEMALE,
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentRole: {},
      offenceDetails: {
        offenceCode: 1002,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G6123VU',
      },
      incidentStatement: { statement: 'text here', completed: true },
      startedByUserId: 'TEST_GEN',
    },
    incidentRole: IncidentRole.ASSISTED,
    prisoner: {
      offenderNo: 'A8383DY',
      firstName: 'PHYLLIS',
      lastName: 'SMITH',
      physicalAttributes: { gender: 'Unknown' },
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 4012,
        description: 'RECP',
        agencyName: 'Moorland (HMP & YOI)',
      },
      categoryCode: undefined,
      language: undefined,
      prisonerNumber: 'A8383DY',
      friendlyName: 'Phyllis Smith',
      displayName: 'Smith, Phyllis',
      currentLocation: 'RECP',
      dateOfBirth: undefined,
    },
    associatedPrisoner: undefined,
  })

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivendell' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Hogwarts' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Arundel' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Timbuktu' },
    { locationId: 3, locationPrefix: 'P3', userDescription: 'Narnia' },
  ])

  placeOnReportService.getCheckYourAnswersInfo.mockResolvedValue({
    isYouthOffender: false,
    statement: '',
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'Test McTest',
      },
      {
        label: 'Date of incident',
        value: '8 March 2020',
      },
      {
        label: 'Time of incident',
        value: '10:45',
      },
      {
        label: 'Location',
        value: 'Rivendell',
      },
    ],
  })

  const qAndAs = [
    {
      question: 'What type of offence did Phyllis Smith commit?',
      answer: 'Assault, fighting, or endangering the health or personal safety of others',
    },
  ]

  decisionTreeService.getAdjudicationOffences.mockResolvedValue({
    questionsAndAnswers: qAndAs,
    incidentRule: undefined,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
  })

  placeOnReportService.completeDraftAdjudication.mockResolvedValue(2342)

  placeOnReportService.getGenderDataForTable.mockResolvedValue({
    data: [
      {
        label: 'What is the gender of the prisoner?',
        value: properCase(PrisonerGender.FEMALE),
      },
    ],
    changeLinkHref: adjudicationUrls.selectGender.url.edit('A8383DY', 100),
  })

  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService, decisionTreeService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /check-your-answers', () => {
  it('should load the check-your-answers page', () => {
    return request(app)
      .get(adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Check your answers')
        expect(response.text).toContain('Accept and place on report')
        expect(response.text).toContain(
          'By accepting these details you are confirming that, to the best of your knowledge, these details are correct.'
        )
        expect(response.text).toContain('What type of offence did Phyllis Smith commit?')
        expect(response.text).toContain('Assault, fighting, or endangering the health or personal safety of others')
        expect(response.text).toContain('This offence broke')
        expect(response.text).toContain('Prison rule 51, paragraph 1')
        expect(response.text).toContain('Commits any assault')
        expect(response.text).toContain('What is the gender of the prisoner?')
        expect(placeOnReportService.getCheckYourAnswersInfo).toHaveBeenCalledTimes(1)
      })
  })
})

describe('GET /check-your-answers for youth offender', () => {
  beforeEach(() => {
    placeOnReportService.getCheckYourAnswersInfo.mockResolvedValue({
      isYouthOffender: true,
      statement: '',
      incidentDetails: [
        {
          label: 'Reporting Officer',
          value: 'Test McTest',
        },
      ],
    })
  })

  it('should load the check-your-answers page with rule 55', () => {
    return request(app)
      .get(adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Prison rule 55')
        expect(response.text).not.toContain('Prison rule 51')
      })
  })

  it('should load the check-your-answers page with female gender', () => {
    return request(app)
      .get(adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Female')
        expect(response.text).not.toContain('Male')
      })
  })
})

describe('POST /check-your-answers', () => {
  it('should redirect to the correct page if details is complete', () => {
    return request(app)
      .post(adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect(302)
      .expect('Location', adjudicationUrls.confirmedOnReport.urls.start(2342))
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.completeDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect(response => {
        expect(response.text).toContain('Error: Internal Error')
      })
  })
})
