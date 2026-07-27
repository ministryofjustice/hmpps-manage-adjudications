import { Express } from 'express'
import request from 'supertest'
import { Readable } from 'stream'
import { PrisonerAdjudicationsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import appWithAllRoutes from './testutils/appSetup'
import PlaceOnReportService from '../services/placeOnReportService'
import mockPermissions from './testutils/mockPermissions'

jest.mock('../services/placeOnReportService.ts')
jest.mock('@ministryofjustice/hmpps-prison-permissions-lib', () => ({
  ...jest.requireActual('@ministryofjustice/hmpps-prison-permissions-lib'),
  isGranted: jest.fn(),
  prisonerPermissionsGuard: jest.fn(),
}))

const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>

const buildApp = (granted: boolean): Express => {
  mockPermissions({ [PrisonerAdjudicationsPermission.read]: granted })
  return appWithAllRoutes({ production: false }, { placeOnReportService })
}

afterEach(() => jest.resetAllMocks())

describe('GET /prisoner/:prisonerNumber/image', () => {
  it('serves the prisoner image when the user may view the prisoner', () => {
    placeOnReportService.getPrisonerImage.mockResolvedValue(Readable.from(Buffer.from('image-bytes')))

    return request(buildApp(true))
      .get('/prisoner/G7234VB/image')
      .expect(200)
      .expect('Content-Type', /image\/jpeg/)
      .expect(() => {
        expect(placeOnReportService.getPrisonerImage).toHaveBeenCalledWith('G7234VB', expect.anything())
      })
  })

  it('serves the placeholder without fetching the image when the user may not view the prisoner', () => {
    return request(buildApp(false))
      .get('/prisoner/G7234VB/image')
      .expect(200)
      .expect(() => {
        expect(placeOnReportService.getPrisonerImage).not.toHaveBeenCalled()
      })
  })
})
