import { PermissionsService, PrisonerAdjudicationsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'

/**
 * Builds the minimal PrisonerPermissions shape that the library's isGranted() reads for the
 * adjudications read permission (path: domainGroups.prisonerSpecific.prisonerAdjudications.<perm>).
 */
export const adjudicationsPermissions = (granted: boolean) => ({
  domainGroups: {
    prisonerSpecific: {
      prisonerAdjudications: {
        [PrisonerAdjudicationsPermission.read]: granted,
      },
    },
  },
})

/**
 * A stand-in PermissionsService for route tests. getPrisonerPermissions returns a granted or denied
 * adjudications permission so the prisonerPermissionsGuard lets the request through or rejects it,
 * without touching prisoner-search.
 */
export const mockPermissionsService = (
  granted = true,
  prisoner: unknown = { prisonerNumber: 'G7234VB', prisonId: 'MDI' },
): PermissionsService =>
  ({
    getPrisonerDetails: jest.fn().mockResolvedValue(prisoner),
    getPrisonerPermissions: jest.fn().mockReturnValue(adjudicationsPermissions(granted)),
  }) as unknown as PermissionsService
