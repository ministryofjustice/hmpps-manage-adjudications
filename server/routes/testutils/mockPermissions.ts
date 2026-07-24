import {
  isGranted,
  PermissionsService,
  PrisonerPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'

/**
 * Test helper recommended by the permissions library
 * (https://github.com/ministryofjustice/hmpps-prison-permissions-lib/blob/main/readme/mocking.md):
 * mock the library's isGranted and prisonerPermissionsGuard rather than depending on the internal
 * shape of the permissions object.
 *
 * Each test file that uses this must first mock the library, keeping the real enums/PermissionsService
 * but replacing the two functions:
 *
 *   jest.mock('@ministryofjustice/hmpps-prison-permissions-lib', () => ({
 *     ...jest.requireActual('@ministryofjustice/hmpps-prison-permissions-lib'),
 *     isGranted: jest.fn(),
 *     prisonerPermissionsGuard: jest.fn(),
 *   }))
 *
 * Call mockPermissions(...) before building the app, since the guard middleware is created when the
 * routes are wired.
 */
export default function mockPermissions(permissions: Partial<Record<PrisonerPermission, boolean>>): void {
  ;(isGranted as jest.MockedFunction<typeof isGranted>).mockImplementation(perm => permissions[perm] ?? false)
  ;(prisonerPermissionsGuard as jest.MockedFunction<typeof prisonerPermissionsGuard>).mockImplementation(
    (_service, options) => async (_req, _res, next) => {
      const denied = options.requestDependentOn.filter(perm => !permissions[perm])
      return denied.length ? next(permissionDeniedError(denied)) : next()
    },
  )
}

// Mimics the library's PrisonerPermissionError (which is not publicly exported) so the app's error
// handler recognises it via deniedPermissionChecks and renders the forbidden page, not a generic 500.
function permissionDeniedError(denied: PrisonerPermission[]): Error {
  return Object.assign(new Error('Permission denied'), { status: 403, deniedPermissionChecks: denied })
}

// Minimal PermissionsService for the app harness. With the guard and isGranted mocked, its methods
// are only reached by the prisoner image route, which just needs them not to throw.
export const stubPermissionsService = (): PermissionsService =>
  ({
    getPrisonerDetails: jest.fn().mockResolvedValue({}),
    getPrisonerPermissions: jest.fn().mockReturnValue({}),
  }) as unknown as PermissionsService
