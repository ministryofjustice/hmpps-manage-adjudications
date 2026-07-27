import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'

/**
 * hmpps-prison-permissions-lib reads a specific "PrisonUser" shape from res.locals.user:
 * authSource === 'nomis', caseLoads, activeCaseLoadId and userRoles. This app exposes the same facts
 * under different names (allCaseLoads, meta.caseLoadId) and decodes roles from the token on demand,
 * so map them across once here, after populateCurrentUser, for the permission guard/service to read.
 *
 * authSource must be 'nomis' or the library's isInUsersCaseLoad ignores caseLoads and denies everyone.
 */
export default function mapUserForPrisonPermissions(): RequestHandler {
  return (req, res, next) => {
    const { user } = res.locals
    if (user?.token) {
      const { authorities: userRoles = [] } = jwtDecode(user.token) as { authorities?: string[] }
      res.locals.user = {
        ...user,
        authSource: 'nomis',
        userRoles,
        caseLoads: user.allCaseLoads ?? [],
        activeCaseLoadId: user.meta?.caseLoadId ?? user.activeCaseLoadId,
      }
    }
    next()
  }
}
