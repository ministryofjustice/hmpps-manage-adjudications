import { Request, Response } from 'express'
import { jwtDecode } from 'jwt-decode'
import mapUserForPrisonPermissions from './mapUserForPrisonPermissions'

jest.mock('jwt-decode')

describe('mapUserForPrisonPermissions', () => {
  const next = jest.fn()

  beforeEach(() => jest.resetAllMocks())

  it('maps the app user onto the shape the permissions library reads', () => {
    ;(jwtDecode as jest.Mock).mockReturnValue({ authorities: ['ROLE_POM'] })
    const res = {
      locals: { user: { token: 'a.b.c', allCaseLoads: [{ caseLoadId: 'MDI' }], meta: { caseLoadId: 'MDI' } } },
    } as unknown as Response

    mapUserForPrisonPermissions()({} as Request, res, next)

    expect(res.locals.user).toMatchObject({
      authSource: 'nomis',
      userRoles: ['ROLE_POM'],
      caseLoads: [{ caseLoadId: 'MDI' }],
      activeCaseLoadId: 'MDI',
    })
    expect(next).toHaveBeenCalled()
  })

  it('leaves the user untouched when there is no token', () => {
    const res = { locals: {} } as unknown as Response

    mapUserForPrisonPermissions()({} as Request, res, next)

    expect(res.locals.user).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })
})
