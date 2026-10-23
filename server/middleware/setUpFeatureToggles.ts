import { RequestHandler } from 'express'
import { featureTogglesFor } from '../utils/featureToggles'

// Must run after populateCurrentUser, which sets the user's active caseload in res.locals.user.meta.
// The caseload is `caseLoadId` from the user service, or `id` when it comes from the frontend components API.
export default function setUpFeatureToggles(): RequestHandler {
  return (req, res, next) => {
    const meta = res.locals.user?.meta
    res.locals.featureToggles = featureTogglesFor(meta?.caseLoadId ?? meta?.id)
    next()
  }
}
