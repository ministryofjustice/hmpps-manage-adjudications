import PlaceOnReportService from './placeOnReportService'
import PrisonApiClient from '../data/prisonApiClient'
import HmppsAuthClient from '../data/hmppsAuthClient'

const getPrisonerImage = jest.fn()
const getPrisonerDetails = jest.fn()
const postDraftIncidentStatement = jest.fn()
const startNewDraftAdjudication = jest.fn()
const getDraftAdjudication = jest.fn()
const submitCompleteDraftAdjudication = jest.fn()
const editDraftIncidentDetails = jest.fn()
const putDraftIncidentStatement = jest.fn()
const getAllDraftAdjudicationsForUser = jest.fn()
const getAgency = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerImage, getPrisonerDetails, getAgency }
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
    }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'some token'

describe('placeOnReportService', () => {
  let service: PlaceOnReportService

  const user = {
    activeCaseLoadId: 'MDI',
    name: 'User Smith',
    username: 'user1',
    token: 'token-1',
    authSource: 'auth',
  }

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new PlaceOnReportService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('startNewDraftAdjudication', () => {
    it('returns the adjudication details with new id', async () => {
      startNewDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          adjudicationNumber: 4567123,
          id: 1,
          prisonerNumber: 'G2996UX',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25a',
          },
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
            handoverDeadline: '2021-10-30T15:40:25.884',
          },
        },
      })

      const result = await service.startNewDraftAdjudication(
        '2021-10-28T15:40:25.884',
        3,
        'G2996UX',
        'T3356FU',
        '25a',
        '25a',
        null,
        null,
        user
      )
      expect(startNewDraftAdjudication).toBeCalledWith({
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        locationId: 3,
        prisonerNumber: 'G2996UX',
        agencyId: 'MDI',
        // Added by temporary code to preserve APi compatibility
        incidentRole: {
          roleCode: '25a',
          associatedPrisonersNumber: 'T3356FU',
        },
      })
      expect(result).toEqual({
        draftAdjudication: {
          id: 1,
          adjudicationNumber: 4567123,
          prisonerNumber: 'G2996UX',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25a',
          },
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
            handoverDeadline: '2021-10-30T15:40:25.884',
          },
        },
      })
    })
  })

  describe('getReporter', () => {
    it('returns the users name', async () => {
      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Test User',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })
      const result = await service.getReporterName('TEST_GEN', user)
      expect(result).toEqual('Test User')
    })
  })

  describe('getCheckYourAnswersInfo', () => {
    it('returns the draft adjudication information - no completed adjudication number', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 10,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26152,
            dateTimeOfIncident: '2021-11-04T07:20:00',
          },
          incidentStatement: {
            id: 9,
            statement:
              "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
          },
          startedByUserId: 'TEST_GEN',
        },
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Natalie Clamp',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })

      const locations = [
        { locationId: 26152, locationPrefix: 'P3', userDescription: 'place 3', description: '' },
        { locationId: 26155, locationPrefix: 'PC', userDescription: "Prisoner's cell", description: '' },
        { locationId: 26151, locationPrefix: 'P1', userDescription: 'place 1', description: '' },
      ]

      const result = await service.getCheckYourAnswersInfo(10, locations, user)
      const expectedResult = {
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'N. Clamp',
          },
          {
            label: 'Date',
            value: '4 November 2021',
          },
          {
            label: 'Time',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'place 3',
          },
        ],
        statement: "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the draft adjudication information - completed adjudication number included', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 10,
          adjudicationNumber: 123456,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26152,
            dateTimeOfIncident: '2021-11-04T07:20:00',
          },
          incidentStatement: {
            id: 9,
            statement:
              "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
          },
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-04T09:21:21.95935',
        },
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Natalie Clamp',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })

      const locations = [
        { locationId: 26152, locationPrefix: 'P3', userDescription: 'place 3', description: '' },
        { locationId: 26155, locationPrefix: 'PC', userDescription: "Prisoner's cell", description: '' },
        { locationId: 26151, locationPrefix: 'P1', userDescription: 'place 1', description: '' },
      ]

      const result = await service.getCheckYourAnswersInfo(10, locations, user)
      const expectedResult = {
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'N. Clamp',
          },
          {
            label: 'Date',
            value: '4 November 2021',
          },
          {
            label: 'Time',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'place 3',
          },
        ],
        statement: "John didn't want to go to chapel today. He pushed over some pews and threw things on the floor.",
        adjudicationNumber: 123456,
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
      getPrisonerDetails.mockResolvedValue({
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
      })

      const result = await service.getPrisonerDetails('A1234AA', user)

      expect(result).toEqual({
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
        displayName: 'Smith, John',
        firstName: 'JOHN',
        friendlyName: 'John Smith',
        lastName: 'SMITH',
        offenderNo: 'A1234AA',
        prisonerNumber: 'A1234AA',
        currentLocation: '1-2-015',
      })
      expect(PrisonApiClient).toBeCalledWith(token)
      expect(getPrisonerDetails).toBeCalledWith('A1234AA')
    })
    it('displays correct location when the prisoner is in CSWAP', async () => {
      getPrisonerDetails.mockResolvedValue({
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: 'CSWAP' },
        categoryCode: 'C',
      })
      const result = await service.getPrisonerDetails('A1234AA', user)
      expect(result.currentLocation).toEqual('No cell allocated')
    })
  })

  describe('addOrUpdateDraftIncidentStatement', () => {
    const draftAdjudicationResult = {
      draftAdjudication: {
        id: 4,
        prisonerNumber: 'A12345',
        incidentDetails: {
          locationId: 2,
          dateTimeOfIncident: '2020-12-10T10:00:00',
        },
        incidentStatement: {
          statement: 'test',
        },
      },
    }
    postDraftIncidentStatement.mockResolvedValue(draftAdjudicationResult)
    putDraftIncidentStatement.mockResolvedValue(draftAdjudicationResult)

    it('makes the api call to create a new statement and returns data', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
        },
      })
      const response = await service.addOrUpdateDraftIncidentStatement(4, 'This is a statement', true, user)

      expect(postDraftIncidentStatement).toBeCalledWith(4, { statement: 'This is a statement', completed: true })

      expect(response).toStrictEqual({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
    })

    it('makes the api call to edit an existing statement and returns data', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
      const response = await service.addOrUpdateDraftIncidentStatement(4, 'This is a statement', true, user)

      expect(putDraftIncidentStatement).toBeCalledWith(4, { statement: 'This is a statement', completed: true })

      expect(response).toStrictEqual({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
    })
  })
  describe('completeDraftAdjudication', () => {
    it('calls api and returns the reported adjudication number', async () => {
      submitCompleteDraftAdjudication.mockResolvedValue({
        adjudicationNumber: 234,
        dateTimeReportExpired: '2021-11-12T13:55:34.143Z',
        incidentDetails: {
          dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
          locationId: 0,
        },
        incidentStatement: {
          completed: false,
          statement: 'string',
        },
        prisonerNumber: 'G2996UX',
      })
      const response = await service.completeDraftAdjudication(4, user)
      expect(response).toStrictEqual(234)
    })
  })
  describe('getDraftIncidentDetailsForEditing', () => {
    it('should return draft incident details in format ready for editing', async () => {
      const expectedResult = { dateTime: { date: '08/11/2021', time: { hour: '10', minute: '00' } }, locationId: 1234 }

      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 1234,
            dateTimeOfIncident: '2021-11-08T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })

      const response = await service.getDraftIncidentDetailsForEditing(4, user)
      expect(response).toEqual(expectedResult)
    })
  })
  describe('editDraftIncidentDetails', () => {
    it('creates the edited incident details object and sends', async () => {
      const expectedResult = {
        adjudicationNumber: 234,
        incidentDetails: {
          dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
          locationId: 12123123,
        },
        incidentRole: {
          associatedPrisonersNumber: 'G2996UX',
          roleCode: '25a',
        },
        incidentStatement: {
          completed: false,
          statement: 'string',
        },
        prisonerNumber: 'G2996UX',
      }
      editDraftIncidentDetails.mockResolvedValue(expectedResult)
      const response = await service.editDraftIncidentDetails(4, '2021-11-09T13:55:34.143Z', 12123123, user)
      expect(response).toEqual(expectedResult)
      expect(editDraftIncidentDetails).toBeCalledWith(4, {
        dateTimeOfIncident: '2021-11-09T13:55:34.143Z',
        locationId: 12123123,
      })
    })
  })

  describe('getAllDraftAdjudicationsForUser', () => {
    it('gets all the users draft reports and enhances them, and then sorts by surname', async () => {
      getPrisonerDetails.mockResolvedValueOnce({
        offenderNo: 'A12345',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
      })
      getPrisonerDetails.mockResolvedValueOnce({
        offenderNo: 'G2996UX',
        firstName: 'JACK',
        lastName: 'BURROWS',
        assignedLivingUnit: { description: '1-2-015' },
        categoryCode: 'C',
      })
      getAllDraftAdjudicationsForUser.mockResolvedValue({
        draftAdjudications: [
          {
            startedByUserId: 'user1',
            id: 1,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-16T14:15:00',
              locationId: 123,
            },
            incidentStatement: {
              completed: false,
              statement: 'test',
            },
            prisonerNumber: 'A12345',
          },
          {
            startedByUserId: 'user1',
            id: 2,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-20T09:45:00',
              locationId: 456,
            },
            incidentStatement: {
              completed: true,
              statement: 'test',
            },
            prisonerNumber: 'G2996UX',
          },
        ],
      })
      const response = await service.getAllDraftAdjudicationsForUser(user)
      expect(response).toEqual([
        {
          startedByUserId: 'user1',
          displayName: 'Burrows, Jack',
          friendlyName: 'Jack Burrows',
          id: 2,
          incidentDate: '20 November 2021',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-20T09:45:00',
            locationId: 456,
          },
          incidentStatement: {
            completed: true,
            statement: 'test',
          },
          incidentTime: '09:45',
          prisonerNumber: 'G2996UX',
        },
        {
          startedByUserId: 'user1',
          displayName: 'Smith, John',
          friendlyName: 'John Smith',
          id: 1,
          incidentDate: '16 November 2021',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-16T14:15:00',
            locationId: 123,
          },
          incidentStatement: {
            completed: false,
            statement: 'test',
          },
          incidentTime: '14:15',
          prisonerNumber: 'A12345',
        },
      ])
    })
    it('deals with no returned reports elegantly', async () => {
      getAllDraftAdjudicationsForUser.mockResolvedValue({ draftAdjudications: [] })
      const response = await service.getAllDraftAdjudicationsForUser(user)
      expect(response).toEqual([])
    })
  })
  describe('getInfoForTaskListStatuses', () => {
    it('returns the correct response when there is no incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 104,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 357591,
            dateTimeOfIncident: '2021-10-12T20:00:00',
            handoverDeadline: '2021-10-14T20:00:00',
          },
          startedByUserId: 'TEST_GEN',
        },
      })
      const response = await service.getInfoForTaskListStatuses(104, user)
      expect(response).toEqual({
        handoverDeadline: '2021-10-14T20:00:00',
        statementPresent: false,
        statementComplete: false,
      })
    })
    it('returns the correct response when there is an incomplete incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 104,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 357591,
            dateTimeOfIncident: '2021-10-12T20:00:00',
            handoverDeadline: '2021-10-14T20:00:00',
          },
          incidentStatement: {
            statement: 'This is incomplete',
            completed: false,
          },
          startedByUserId: 'TEST_GEN',
        },
      })
      const response = await service.getInfoForTaskListStatuses(104, user)
      expect(response).toEqual({
        handoverDeadline: '2021-10-14T20:00:00',
        statementPresent: true,
        statementComplete: false,
      })
    })
    it('returns the correct response when there is a complete incident statement', async () => {
      getDraftAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 92,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26999,
            dateTimeOfIncident: '2021-11-18T14:50:00',
            handoverDeadline: '2021-11-23T00:00:00',
          },
          incidentStatement: {
            statement: 'ghjghjgh',
            completed: true,
          },
          startedByUserId: 'NCLAMP_GEN',
        },
      })
      const response = await service.getInfoForTaskListStatuses(92, user)
      expect(response).toEqual({
        handoverDeadline: '2021-11-23T00:00:00',
        statementPresent: true,
        statementComplete: true,
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
      const staffMembers = [
        {
          activeCaseLoadId: 'MDI',
          email: 'testerPerson@justice.gov.uk',
          firstName: 'Tester',
          lastName: 'Person',
          name: 'Tester Person',
          staffId: 1234564789,
          username: 'RO_USER_TEST',
          verified: true,
        },
      ]

      const response = await service.getAssociatedStaffDetails(staffMembers, user)
      expect(response).toEqual([{ ...staffMembers[0], currentLocation: 'Moorland (HMP & YOI)' }])
    })
    it('returns the correct response when the caseload is the central agency id', async () => {
      const staffMembers = [
        {
          activeCaseLoadId: 'CADM_I',
          email: 'testerPerson@justice.gov.uk',
          firstName: 'Tester',
          lastName: 'Person',
          name: 'Tester Person',
          staffId: 1234564789,
          username: 'RO_USER_TEST',
          verified: true,
        },
      ]
      const response = await service.getAssociatedStaffDetails(staffMembers, user)
      expect(response).toEqual([
        {
          ...staffMembers[0],
          currentLocation: 'Central Admin',
        },
      ])
    })
  })
})
