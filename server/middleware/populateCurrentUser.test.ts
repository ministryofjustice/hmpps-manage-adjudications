import { Request, Response } from 'express'
import { jwtDecode } from 'jwt-decode'
import populateCurrentUser from './populateCurrentUser'
import UserService from '../services/userService'

jest.mock('jwt-decode')

describe('populateCurrentUser', () => {
  const next = jest.fn()
  const getUserWithSession = jest.fn()
  const userService = { getUserWithSession } as unknown as UserService

  beforeEach(() => {
    jest.resetAllMocks()
    getUserWithSession.mockResolvedValue({
      username: 'TEST_USER',
      userId: 'manage-users-id',
      activeCaseLoad: { caseLoadId: 'MDI', description: 'Moorland' },
    })
  })

  function responseFor(user: Record<string, unknown>): Response {
    return { locals: { user } } as unknown as Response
  }

  it('adds the resolved user, caseload and the user id and UUID from the sign-in token', async () => {
    ;(jwtDecode as jest.Mock).mockReturnValue({ user_id: '231232', user_uuid: '11111111-1111-1111-1111-111111111111' })
    const res = responseFor({ username: 'TEST_USER', token: 'a.b.c', authSource: 'nomis' })

    await populateCurrentUser(userService)({ session: {} } as Request, res, next)

    expect(jwtDecode).toHaveBeenCalledWith('a.b.c')
    expect(res.locals.user).toMatchObject({
      username: 'TEST_USER',
      userId: '231232',
      userUuid: '11111111-1111-1111-1111-111111111111',
      meta: { caseLoadId: 'MDI', description: 'Moorland' },
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('keeps the user id from manage users and leaves the UUID unset when the token does not have them', async () => {
    ;(jwtDecode as jest.Mock).mockReturnValue({})
    const res = responseFor({ username: 'TEST_USER', token: 'a.b.c', authSource: 'nomis' })

    await populateCurrentUser(userService)({ session: {} } as Request, res, next)

    expect(res.locals.user.userId).toEqual('manage-users-id')
    expect(res.locals.user.userUuid).toBeUndefined()
    expect(next).toHaveBeenCalledWith()
  })

  it('does not decode a token when there is none', async () => {
    const res = responseFor({ username: 'TEST_USER' })

    await populateCurrentUser(userService)({ session: {} } as Request, res, next)

    expect(jwtDecode).not.toHaveBeenCalled()
    expect(res.locals.user.username).toEqual('TEST_USER')
    expect(next).toHaveBeenCalledWith()
  })

  it('does nothing when no user is present', async () => {
    const res = { locals: {} } as Response

    await populateCurrentUser(userService)({ session: {} } as Request, res, next)

    expect(getUserWithSession).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
  })
})
