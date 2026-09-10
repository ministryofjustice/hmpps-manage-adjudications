import { RequestHandler } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import logger from '../../logger'
import UserService from '../services/userService'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUserWithSession(req, res.locals.user.token))
        if (user) {
          const activeCaseLoad = res.locals.userMetadata ?? user.activeCaseLoad
          res.locals.user = { ...user, ...res.locals.user, meta: { ...activeCaseLoad } }
          telemetry.setSpanAttributes({
            username: res.locals.user.username,
            ...(res.locals.user.meta?.caseLoadId && { activeCaseLoadId: res.locals.user.meta.caseLoadId }),
          })
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
