import type { Request, Response } from 'express'
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'

/**
 * Records who made each request in App Insights: the library adds `userId` and `userUuid` from `res.locals.user`;
 * `username` and `activeCaseLoadId` are added here. Must be mounted after the current user and caseload are set up
 * (populateCurrentUser and mapUserForPrisonPermissions).
 */
export default function userTelemetry() {
  return telemetryMiddleware.addUserMetadataToTelemetry({
    getAttributes: (_req: Request, res: Response) => ({
      username: res.locals.user?.username,
      activeCaseLoadId: res.locals.user?.activeCaseLoadId ?? res.locals.user?.meta?.caseLoadId,
    }),
  })
}
