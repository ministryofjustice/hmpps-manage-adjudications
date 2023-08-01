import moment from 'moment'
import PlaceOnReportService from './placeOnReportService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import adjudicationUrls from '../utils/urlGenerator'
import { PrisonerGender } from '../data/DraftAdjudicationResult'
import TestData from '../routes/testutils/testData'

const testData = new TestData()

const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()
const getBatchPrisonerDetails = jest.fn()
const postDraftIncidentStatement = jest.fn()
const startNewDraftAdjudication = jest.fn()
const getDraftAdjudication = jest.fn()
const submitCompleteDraftAdjudication = jest.fn()
const editDraftIncidentDetails = jest.fn()
const putDraftIncidentStatement = jest.fn()
const getAllDraftAdjudicationsForUser = jest.fn()
const updateIncidentRole = jest.fn()
const getAgency = jest.fn()
const saveYouthOffenderStatus = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails, getAgency, getBatchPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      postDraftIncidentStatement,
      putDraftIncidentStatement,
      startNewDraftAdjudication,
      getDraftAdjudication,
      submitCompleteDraftAdjudication,
      editDraftIncidentDetails,
      getAllDraftAdjudicationsForUser,
      updateIncidentRole,
      saveYouthOffenderStatus,
    }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'

describe('placeOnReportService', () => {
  let service: PlaceOnReportService

  const user = testData.userFromUsername('user1')

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PlaceOnReportService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('startNewDraftAdjudication', () => {
    it('returns the adjudication details with new id', async () => {
      getPrisonerDetails.mockResolvedValue(
        testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
        })
      )
      startNewDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 1,
          adjudicationNumber: 4567123,
          prisonerNumber: 'G2996UX',
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
        }),
      })

      const result = await service.startNewDraftAdjudication(
        '2021-10-28T15:40:25.884',
        3,
        'G2996UX',
        user,
        PrisonerGender.MALE,
        '2021-10-29T15:40:25.884'
      )
      expect(startNewDraftAdjudication).toBeCalledWith({
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        dateTimeOfDiscovery: '2021-10-29T15:40:25.884',
        locationId: 3,
        prisonerNumber: 'G2996UX',
        agencyId: 'MDI',
        gender: PrisonerGender.MALE,
        overrideAgencyId: null,
      })
      expect(result).toEqual({
        draftAdjudication: testData.draftAdjudication({
          id: 1,
          adjudicationNumber: 4567123,
          prisonerNumber: 'G2996UX',
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
        }),
      })
    })
    it('returns the adjudication details with new id and override agency id', async () => {
      getPrisonerDetails.mockResolvedValue(
        testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
          agencyId: 'LEI',
        })
      )

      await service.startNewDraftAdjudication(
        '2021-10-28T15:40:25.884',
        3,
        'G2996UX',
        user,
        PrisonerGender.MALE,
        '2021-10-29T15:40:25.884'
      )
      expect(startNewDraftAdjudication).toBeCalledWith({
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        dateTimeOfDiscovery: '2021-10-29T15:40:25.884',
        locationId: 3,
        prisonerNumber: 'G2996UX',
        agencyId: 'MDI',
        gender: PrisonerGender.MALE,
        overrideAgencyId: 'LEI',
      })
    })
  })

  describe('getReporter', () => {
    it('returns the users name', async () => {
      hmppsAuthClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))
      const result = await service.getReporterName('TEST_GEN', user)
      expect(result).toEqual('Test User')
    })
  })

  describe('getCheckYourAnswersInfo', () => {
    it('returns the draft adjudication information - no completed adjudication number', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 10,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-04T07:20:00',
          dateTimeOfDiscovery: '2021-11-05T07:20:00',
          locationId: 25538,
          incidentStatement: {
            statement:
              "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
          },
        }),
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))

      const locations = testData.residentialLocations()

      const result = await service.getCheckYourAnswersInfo(10, locations, user)
      const expectedResult = {
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'T. User',
          },
          {
            label: 'Date of incident',
            value: '4 November 2021',
          },
          {
            label: 'Time of incident',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'Houseblock 1',
          },
          {
            label: 'Date of discovery',
            value: '5 November 2021',
          },
          {
            label: 'Time of discovery',
            value: '07:20',
          },
        ],
        statement: "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
        isYouthOffender: false,
        adjudicationNumber: null as never,
        chargeNumber: null as never,
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the draft adjudication information - completed adjudication number included', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 10,
          adjudicationNumber: 123456,
          chargeNumber: '123456',
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-04T07:20:00',
          dateTimeOfDiscovery: '2021-11-05T07:21:00',
          locationId: 25655,
          incidentStatement: {
            statement:
              "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
          },
        }),
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))

      const locations = testData.residentialLocations()

      const result = await service.getCheckYourAnswersInfo(10, locations, user)
      const expectedResult = {
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'T. User',
          },
          {
            label: 'Date of incident',
            value: '4 November 2021',
          },
          {
            label: 'Time of incident',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'Houseblock 2',
          },
          {
            label: 'Date of discovery',
            value: '5 November 2021',
          },
          {
            label: 'Time of discovery',
            value: '07:21',
          },
        ],
        statement: "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
        adjudicationNumber: 123456,
        chargeNumber: '123456',
        isYouthOffender: false,
      }
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getPrisonerImage', () => {
    it('uses prison api to request image data', async () => {
      getPrisonerImage.mockResolvedValue('image data')

      const result = await service.getPrisonerImage('A1234AA', user)

      expect(result).toEqual('image data')
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerImage).toBeCalledWith('A1234AA')
    })
  })

  describe('getPrisonerDetails', () => {
    it('returns correctly formatted prisoner details', async () => {
      getPrisonerDetails.mockResolvedValue(
        testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
        })
      )

      const result = await service.getPrisonerDetails('A1234AA', user)

      expect(result).toEqual(
        testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'John',
          lastName: 'Smith',
        })
      )
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerDetails).toBeCalledWith('A1234AA')
    })
    it('displays correct location when the prisoner is in CSWAP', async () => {
      getPrisonerDetails.mockResolvedValue(
        testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnitDesc: 'CSWAP',
        })
      )
      const result = await service.getPrisonerDetails('A1234AA', user)
      expect(result.currentLocation).toEqual('No cell allocated')
    })
  })

  describe('addOrUpdateDraftIncidentStatement', () => {
    const draftAdjudicationResult = {
      draftAdjudication: testData.draftAdjudication({
        id: 4,
        prisonerNumber: 'A12345',
        dateTimeOfIncident: '2020-12-10T10:00:00',
        locationId: 2,
        incidentStatement: {
          statement: 'This is a statement',
        },
      }),
    }
    postDraftIncidentStatement.mockResolvedValue(draftAdjudicationResult)
    putDraftIncidentStatement.mockResolvedValue(draftAdjudicationResult)

    it('makes the api call to create a new statement and returns data', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          dateTimeOfIncident: '2020-12-10T10:00:00',
          locationId: 2,
          incidentStatement: null,
        }),
      })
      const response = await service.addOrUpdateDraftIncidentStatement(4, 'This is a statement', true, user)

      expect(postDraftIncidentStatement).toBeCalledWith(4, { statement: 'This is a statement', completed: true })

      expect(response).toEqual({
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          dateTimeOfIncident: '2020-12-10T10:00:00',
          locationId: 2,
          incidentStatement: {
            statement: 'This is a statement',
          },
        }),
      })
    })

    it('makes the api call to edit an existing statement and returns data', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          locationId: 2,
          dateTimeOfIncident: '2020-12-10T10:00:00',
          incidentStatement: {
            statement: 'Statement that needs to change',
          },
        }),
      })
      const response = await service.addOrUpdateDraftIncidentStatement(4, 'This is a statement', true, user)

      expect(putDraftIncidentStatement).toBeCalledWith(4, { statement: 'This is a statement', completed: true })

      expect(response).toEqual({
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          locationId: 2,
          dateTimeOfIncident: '2020-12-10T10:00:00',
          incidentStatement: {
            statement: 'This is a statement',
          },
        }),
      })
    })
  })
  describe('completeDraftAdjudication', () => {
    it('calls api and returns the reported adjudication number', async () => {
      submitCompleteDraftAdjudication.mockResolvedValue(
        testData.reportedAdjudication({
          chargeNumber: '234',
          dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
          prisonerNumber: 'G2996UX',
        })
      )

      const response = await service.completeDraftAdjudication(4, user)
      expect(response).toStrictEqual('234')
    })
  })
  describe('getDraftIncidentDetailsForEditing', () => {
    it('should return draft incident details in format ready for editing', async () => {
      const expectedResult = {
        dateTime: { date: '08/11/2021', time: { hour: '10', minute: '00' } },
        dateTimeOfDiscovery: { date: '09/11/2021', time: { hour: '10', minute: '00' } },
        locationId: 1234,
        chargeNumber: null as never,
        adjudicationNumber: null as never,
        startedByUserId: 'USER1',
      }

      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          dateTimeOfIncident: '2021-11-08T10:00:00',
          dateTimeOfDiscovery: '2021-11-09T10:00:00',
          locationId: 1234,
        }),
      })

      const response = await service.getDraftIncidentDetailsForEditing('4', user)
      expect(response).toEqual(expectedResult)
    })
  })
  describe('editDraftIncidentDetails', () => {
    it('creates the edited incident details object and sends', async () => {
      const expectedResult = testData.draftAdjudication({
        id: 4,
        chargeNumber: '234',
        prisonerNumber: 'G2996UX',
        dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
        dateTimeOfDiscovery: '2021-11-10T13:55:34.143Z',
        incidentStatement: {
          completed: false,
          statement: 'string',
        },
      })

      editDraftIncidentDetails.mockResolvedValue(expectedResult)
      const response = await service.editDraftIncidentDetails(
        4,
        '2021-11-09T13:55:34.143Z',
        12123123,
        user,
        '2021-11-10T13:55:34.143Z'
      )
      expect(response).toEqual(expectedResult)
      expect(editDraftIncidentDetails).toBeCalledWith(4, {
        dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
        dateTimeOfDiscovery: '2021-11-10T13:55:34.143Z',
        locationId: 12123123,
        removeExistingOffences: false,
      })
    })
  })

  describe('getAllDraftAdjudicationsForUser', () => {
    it('gets all the users draft reports and enhances them', async () => {
      getBatchPrisonerDetails.mockResolvedValue([
        testData.simplePrisoner('A12345', 'JOHN', 'SMITH', '1-2-015'),
        testData.simplePrisoner('G2996UX', 'JACK', 'BURROWS', '1-2-015'),
      ])
      const draftAdjudicationReports = [
        testData.draftAdjudication({
          id: 31,
          prisonerNumber: 'A12345',
          dateTimeOfIncident: '2021-11-16T14:15:00',
        }),
        testData.draftAdjudication({
          id: 58,
          prisonerNumber: 'G2996UX',
          dateTimeOfIncident: '2021-11-20T09:45:00',
        }),
      ]
      getAllDraftAdjudicationsForUser.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 2,
        content: draftAdjudicationReports,
      })
      const response = await service.getAllDraftAdjudicationsForUser(
        user,
        {
          fromDate: moment('16/11/2021', 'DD/MM/YYYY'),
          toDate: moment('21/11/2021', 'DD/MM/YYYY'),
        },
        {
          size: 20,
          number: 0,
        }
      )
      const expectedDraftAdjudicationsContent = [
        testData.draftAdjudication({
          id: 31,
          prisonerNumber: 'A12345',
          dateTimeOfIncident: '2021-11-16T14:15:00',
          otherData: {
            displayName: 'Smith, John',
            formattedDiscoveryDateTime: '16 November 2021 - 14:15',
            friendlyName: 'John Smith',
          },
        }),
        testData.draftAdjudication({
          id: 58,
          prisonerNumber: 'G2996UX',
          dateTimeOfIncident: '2021-11-20T09:45:00',
          otherData: {
            displayName: 'Burrows, Jack',
            formattedDiscoveryDateTime: '20 November 2021 - 09:45',
            friendlyName: 'Jack Burrows',
          },
        }),
      ]
      const expected = {
        size: 10,
        number: 0,
        totalElements: 2,
        content: expectedDraftAdjudicationsContent,
      }
      expect(response).toEqual(expected)
    })
    it('deals with no returned reports elegantly', async () => {
      getAllDraftAdjudicationsForUser.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 0,
        content: [],
      })
      const response = await service.getAllDraftAdjudicationsForUser(
        user,
        {
          fromDate: moment('16/11/2021', 'DD/MM/YYYY'),
          toDate: moment('21/11/2021', 'DD/MM/YYYY'),
        },
        {
          size: 20,
          number: 0,
        }
      )
      expect(response).toEqual({ content: [], number: 0, size: 10, totalElements: 0 })
    })
  })
  describe('getInfoForTaskListStatuses', () => {
    it('returns the correct response when there are no offence details', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 104,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-10-12T20:00',
          incidentStatement: null,
        }),
      })
      const response = await service.getInfoForTaskListStatuses(104, user)
      expect(response).toEqual({
        handoverDeadline: '2021-10-14T20:00',
        offenceDetailsStatus: {
          classes: 'govuk-tag govuk-tag--grey',
          text: 'NOT STARTED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--grey',
          text: 'NOT STARTED',
        },
        offenceDetailsUrl: '/age-of-prisoner/104',
        damagesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        evidenceStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      })
    })
    it('returns the correct response when there is no incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 104,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-10-12T20:00',
          incidentRole: {
            associatedPrisonersNumber: 'G2996UX',
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            roleCode: '25a',
          },
          incidentStatement: null,
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(104, user)
      expect(response).toEqual({
        handoverDeadline: '2021-10-14T20:00',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--grey',
          text: 'NOT STARTED',
        },
        offenceDetailsUrl: '/details-of-offence/104',
        damagesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        evidenceStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      })
    })
    it('returns the correct response when there is an incomplete incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 104,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-10-12T20:00',
          incidentStatement: {
            statement: 'This is incomplete',
            completed: false,
          },
          incidentRole: {
            associatedPrisonersNumber: 'G2996UX',
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            roleCode: '25a',
          },
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
          otherData: {
            damagesSaved: true,
            evidenceSaved: true,
            witnessesSaved: true,
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(104, user)
      expect(response).toEqual({
        handoverDeadline: '2021-10-14T20:00',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--blue',
          text: 'IN PROGRESS',
        },
        offenceDetailsUrl: '/details-of-offence/104',
        damagesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        evidenceStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        witnessesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
      })
    })
    it('returns the correct response when there is a complete incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 92,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-18T14:50:00',
          incidentStatement: {
            statement: 'ghjghjgh',
            completed: true,
          },
          incidentRole: {
            associatedPrisonersNumber: 'G2996UX',
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            roleCode: '25a',
          },
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(92, user)
      expect(response).toEqual({
        handoverDeadline: '2021-11-20T14:50',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: true,
        incidentStatementStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        offenceDetailsUrl: '/details-of-offence/92',
        damagesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        evidenceStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      })
    })
    it('returns the correct data when there are damages present', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 92,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-18T14:50:00',
          incidentRole: {
            associatedPrisonersNumber: 'G2996UX',
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            roleCode: '25a',
          },
          damages: [testData.singleDamage({})],
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
          otherData: {
            damagesSaved: true,
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(92, user)
      expect(response).toEqual({
        handoverDeadline: '2021-11-20T14:50',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--blue',
          text: 'IN PROGRESS',
        },
        offenceDetailsUrl: '/details-of-offence/92',
        damagesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        evidenceStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
        witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      })
    })

    it('returns the correct data when there is evidence present', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 92,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-18T14:50:00',
          damages: [testData.singleDamage({})],
          evidence: [testData.singleEvidence({})],
          incidentStatement: {
            statement: '',
            completed: false,
          },
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
          otherData: {
            damagesSaved: true,
            evidenceSaved: true,
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(92, user)
      expect(response).toEqual({
        handoverDeadline: '2021-11-20T14:50',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--blue',
          text: 'IN PROGRESS',
        },
        offenceDetailsUrl: '/details-of-offence/92',
        damagesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        evidenceStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        witnessesStatus: { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' },
      })
    })
    it('returns the correct data when there are witnesses present', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: testData.draftAdjudication({
          id: 92,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-18T14:50:00',
          damages: [testData.singleDamage({})],
          evidence: [testData.singleEvidence({})],
          witnesses: [testData.singleWitness({})],
          incidentStatement: {
            statement: '',
            completed: false,
          },
          offenceDetails: {
            offenceCode: 3,
            offenceRule: {
              paragraphDescription: 'Committed an assault',
              paragraphNumber: '25(a)',
            },
            victimOtherPersonsName: 'Bob Hope',
            victimPrisonersNumber: 'G2996UX',
            victimStaffUsername: 'ABC12D',
          },
          otherData: {
            damagesSaved: true,
            evidenceSaved: true,
            witnessesSaved: true,
          },
        }),
      })
      const response = await service.getInfoForTaskListStatuses(92, user)
      expect(response).toEqual({
        handoverDeadline: '2021-11-20T14:50',
        offenceDetailsStatus: {
          classes: 'govuk-tag',
          text: 'COMPLETED',
        },
        showLinkForAcceptDetails: false,
        incidentStatementStatus: {
          classes: 'govuk-tag govuk-tag--blue',
          text: 'IN PROGRESS',
        },
        offenceDetailsUrl: '/details-of-offence/92',
        damagesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        evidenceStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
        witnessesStatus: { classes: 'govuk-tag', text: 'COMPLETED' },
      })
    })
  })

  describe('getAssociatedStaffDetails', () => {
    it('returns the correct response', async () => {
      getAgency.mockResolvedValue({
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        longDescription: 'HMP & YOI Moorland Prison near Doncaster',
        agencyType: 'INST',
        active: true,
      })
      const staffMembers = [testData.staffFromName(), testData.staffFromName(null)]

      const response = await service.getAssociatedStaffDetails(staffMembers, user)
      expect(response).toEqual([{ ...staffMembers[0], currentLocation: 'Moorland (HMP & YOI)' }])
    })
    it('returns the correct response when the caseload is the central agency id', async () => {
      const staffMembers = [testData.staffFromName('CADM_I')]

      const response = await service.getAssociatedStaffDetails(staffMembers, user)
      expect(response).toEqual([
        {
          ...staffMembers[0],
          currentLocation: 'Central Admin',
        },
      ])
    })
  })

  describe('updateIncidentRole', () => {
    it('creates the incident role object and sends', async () => {
      const expectedResult = testData.reportedAdjudication({
        chargeNumber: '234',
        prisonerNumber: 'G2996UX',
        incidentRole: {
          associatedPrisonersNumber: 'G2996UX',
          roleCode: '25b',
        },
      })
      updateIncidentRole.mockResolvedValue(expectedResult)
      const response = await service.updateDraftIncidentRole(4, '25b', false, user)
      expect(response).toEqual(expectedResult)
      expect(updateIncidentRole).toBeCalledWith(4, {
        incidentRole: {
          roleCode: '25b',
        },
        removeExistingOffences: false,
      })
    })
  })
  describe('addDraftYouthOffenderStatus', () => {
    it('creates the correct data payload if the prisoner is YOI and sends to the draft adjudication database', async () => {
      const expectedResult = testData.reportedAdjudication({
        chargeNumber: '2483',
        prisonerNumber: 'G6123VU',
      })

      saveYouthOffenderStatus.mockResolvedValue(expectedResult)
      const response = await service.addDraftYouthOffenderStatus(2483, 'yoi', true, user)
      expect(response).toEqual(expectedResult)
      expect(saveYouthOffenderStatus).toBeCalledWith(2483, {
        isYouthOffenderRule: true,
        removeExistingOffences: true,
      })
    })
    it('creates the correct data payload if the prisoner is an adult and sends to the draft adjudication database', async () => {
      const expectedResult = testData.reportedAdjudication({
        adjudicationNumber: 2483,
        prisonerNumber: 'G6123VU',
      })
      saveYouthOffenderStatus.mockResolvedValue(expectedResult)
      const response = await service.addDraftYouthOffenderStatus(2484, 'adult', false, user)
      expect(response).toEqual(expectedResult)
      expect(saveYouthOffenderStatus).toBeCalledWith(2484, {
        isYouthOffenderRule: false,
        removeExistingOffences: false,
      })
    })
  })
  describe('getNextOffencesUrl', () => {
    const offenceExample = {
      offenceCode: 16001,
      offenceRule: {
        paragraphNumber: '16',
        paragraphDescription: 'Intentionally or recklessly sets fire ...',
      },
    }
    it('returns the correct url if the offence details are complete', async () => {
      const expectedResult = adjudicationUrls.detailsOfOffence.urls.start(2483)
      const response = await service.getNextOffencesUrl(offenceExample, 2483)
      expect(response).toEqual(expectedResult)
    })
    it('returns the correct url if the offence details are incomplete', async () => {
      const expectedResult = adjudicationUrls.ageOfPrisoner.urls.start(2483)
      const response = await service.getNextOffencesUrl(undefined, 2483)
      expect(response).toEqual(expectedResult)
    })
  })
  describe('getIncidentStatementStatus', () => {
    it('returns the correct status for the statement - statement not present', async () => {
      const expectedResult = { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' }
      const response = await service.getIncidentStatementStatus(false, false)
      expect(response).toEqual(expectedResult)
    })
    it('returns the correct status for the statement - statement present, complete', async () => {
      const expectedResult = { classes: 'govuk-tag', text: 'COMPLETED' }
      const response = await service.getIncidentStatementStatus(true, true)
      expect(response).toEqual(expectedResult)
    })
    it('returns the correct status for the statement - statement present, not complete', async () => {
      const expectedResult = { classes: 'govuk-tag govuk-tag--blue', text: 'IN PROGRESS' }
      const response = await service.getIncidentStatementStatus(true, false)
      expect(response).toEqual(expectedResult)
    })
  })
  describe('getStatus', () => {
    it('returns the correct status for the offences - offences not present', async () => {
      const expectedResult = { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' }
      const response = await service.getStatus(false)
      expect(response).toEqual(expectedResult)
    })
    it('returns the correct status for the offences - offences present and complete', async () => {
      const expectedResult = { classes: 'govuk-tag', text: 'COMPLETED' }
      const response = await service.getStatus(true)
      expect(response).toEqual(expectedResult)
    })
  })
  describe('checkOffenceDetails', () => {
    const offenceExample = {
      offenceCode: 16001,
      offenceRule: {
        paragraphNumber: '16',
        paragraphDescription: 'Intentionally or recklessly sets fire ...',
      },
    }
    it('returns true if there are offences on the draft', async () => {
      const response = await service.checkOffenceDetails(offenceExample)
      expect(response).toEqual(true)
    })
    it('returns false if there are no offences on the draft', async () => {
      const response = await service.checkOffenceDetails(undefined)
      expect(response).toEqual(false)
    })
  })
})
