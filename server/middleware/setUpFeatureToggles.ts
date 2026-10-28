import type { RequestHandler } from 'express'
import { featureTogglesFor } from '../utils/featureToggles'

// Must run after populateCurrentUser, which sets the user's active caseload in res.locals.user.meta
export default function setUpFeatureToggles(): RequestHandler {
  return (req, res, next) => {
    res.locals.featureToggles = featureTogglesFor(res.locals.user?.meta?.caseLoadId)
    next()
  }
}
