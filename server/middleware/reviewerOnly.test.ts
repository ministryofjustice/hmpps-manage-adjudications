import type { Request, Response } from 'express'
import UserService from '../services/userService'
import reviewerOnly from './reviewerOnly'
import adjudicationUrls from '../utils/urlGenerator'

jest.mock('../services/userService')

const userService = new UserService(null, null) as jest.Mocked<UserService>

describe('reviewerOnly', () => {
  const req = { headers: {} } as Request
  const res = { locals: { user: { token: 'token' } }, render: jest.fn() } as unknown as Response
  const next = jest.fn()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('lets a reviewer through', async () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    await reviewerOnly(userService)(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('shows page not found to anyone else', async () => {
    userService.getUserRoles.mockResolvedValue([])
    await reviewerOnly(userService)(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/notFound.njk', { url: adjudicationUrls.homepage.root })
  })
})
