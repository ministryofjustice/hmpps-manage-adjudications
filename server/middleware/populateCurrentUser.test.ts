import { Request, Response } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import populateCurrentUser from './populateCurrentUser'
import UserService from '../services/userService'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  telemetry: { setSpanAttributes: jest.fn() },
}))

describe('populateCurrentUser', () => {
  const next = jest.fn()
  const getUserWithSession = jest.fn()
  const userService = { getUserWithSession } as unknown as UserService

  beforeEach(() => jest.resetAllMocks())

  it('adds the resolved user and caseload to the active request span', async () => {
    getUserWithSession.mockResolvedValue({
      username: 'TEST_USER',
      activeCaseLoad: { caseLoadId: 'MDI', description: 'Moorland' },
    })
    const req = { session: {} } as Request
    const res = {
      locals: { user: { username: 'TEST_USER', token: 'token', authSource: 'nomis' } },
    } as unknown as Response

    await populateCurrentUser(userService)(req, res, next)

    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      username: 'TEST_USER',
      activeCaseLoadId: 'MDI',
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('does not add telemetry attributes when no user is present', async () => {
    const req = { session: {} } as Request
    const res = { locals: {} } as Response

    await populateCurrentUser(userService)(req, res, next)

    expect(telemetry.setSpanAttributes).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
  })
})
