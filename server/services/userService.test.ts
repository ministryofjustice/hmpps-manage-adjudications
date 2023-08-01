import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { CaseLoad } from '../data/prisonApiClient'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'

const getUserCaseLoads = jest.fn()
jest.mock('../data/hmppsAuthClient')
jest.mock('../data/hmppsManageUsersClient')
jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getUserCaseLoads }
  })
})

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsManageUsersClient: jest.Mocked<HmppsManageUsersClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      hmppsManageUsersClient = new HmppsManageUsersClient() as jest.Mocked<HmppsManageUsersClient>
      userService = new UserService(hmppsAuthClient, hmppsManageUsersClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsManageUsersClient.getUser.mockResolvedValue({ name: 'john smith' } as User)
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
      hmppsManageUsersClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
