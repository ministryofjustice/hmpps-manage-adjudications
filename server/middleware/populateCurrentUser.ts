import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
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
          if (res.locals.user.token) {
            // userUuid is created by HMPPS Auth and identifies the person across all auth sources
            const { user_id: userId, user_uuid: userUuid } = jwtDecode<{ user_id?: string; user_uuid?: string }>(
              res.locals.user.token,
            )
            res.locals.user.userId = userId ?? res.locals.user.userId
            res.locals.user.userUuid = userUuid
          }
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
