import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageUsersClient from '../data/manageUsersClient'
import { CaseLoad } from '../data/prisonApiClient'

const getUserCaseLoads = jest.fn()
jest.mock('../data/hmppsAuthClient')
jest.mock('../data/manageUsersClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getUserCaseLoads }
  })
})

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let manageUsersClient: jest.Mocked<ManageUsersClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient, manageUsersClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)
      const caseLoads = [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: true,
        },
        {
          caseLoadId: 'LEI',
          description: 'Leeds',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: false,
        },
      ] as CaseLoad[]
      getUserCaseLoads.mockResolvedValue(caseLoads)

      const result = await userService.getUser(token)

      expect(result).toEqual({
        activeCaseLoad: caseLoads[0],
        allCaseLoads: caseLoads,
        displayName: 'John Smith',
        name: 'john smith',
      })
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
