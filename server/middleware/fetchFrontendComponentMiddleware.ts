import { RequestHandler } from 'express'
import logger from '../../logger'
import { Services } from '../services'

export default function getFrontendComponents({ frontendComponentService }: Services): RequestHandler {
  return async (req, res, next) => {
    try {
      const { user } = res.locals
      const [header, footer] = await Promise.all([
        frontendComponentService.getFrontendComponent('header', user.token),
        frontendComponentService.getFrontendComponent('footer', user.token),
      ])
      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
      }
      next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      next()
    }
  }
}