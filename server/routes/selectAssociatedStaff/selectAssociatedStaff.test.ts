import { Express } from 'express'
import request from 'supertest'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'

jest.mock('../../services/userService')
jest.mock('../../services/placeOnReportService')

const userService = new UserService(null) as jest.Mocked<UserService>
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { userService, placeOnReportService },
    {
      redirectUrl: `${adjudicationUrls.offenceCodeSelection.urls.question(
        893,
        'committed',
        '1-1-1'
      )}?selectedAnswerId=1-1-1-3`,
    }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-associated-staff', () => {
  describe('with results', () => {
    beforeEach(() => {
      userService.getStaffFromNames.mockResolvedValue([
        {
          username: 'JSMITH_GEN',
          staffId: 485592,
          email: 'john.smith@digital.justice.gov.uk',
          verified: true,
          firstName: 'John',
          lastName: 'Smith',
          name: 'John Smith',
          activeCaseLoadId: 'MDI',
        },
      ])

      placeOnReportService.getAssociatedStaffDetails.mockResolvedValue([
        {
          username: 'JSMITH_GEN',
          staffId: 485592,
          email: 'john.smith@digital.justice.gov.uk',
          verified: true,
          firstName: 'John',
          lastName: 'Smith',
          name: 'John Smith',
          activeCaseLoadId: 'MDI',
          currentLocation: 'Moorland',
        },
      ])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get(`${adjudicationUrls.selectAssociatedStaff.root}?staffFirstName=john&staffLastName=smith`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a staff member')
          expect(res.text).toContain('John Smith')
          expect(res.text).toContain('Moorland')
          expect(res.text).toContain('JSMITH_GEN')
          expect(res.text).toContain(
            `<a href="${adjudicationUrls.offenceCodeSelection.urls.question(
              893,
              'committed',
              '1-1-1'
            )}?selectedAnswerId=1-1-1-3&selectedPerson=JSMITH_GEN" class="govuk-link" data-qa="select-staffMember-link-JSMITH_GEN">Select staff member</a>`
          )
        })
    })
  })

  describe('without results', () => {
    beforeEach(() => {
      userService.getStaffFromNames.mockResolvedValue([])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get(`${adjudicationUrls.selectAssociatedStaff.root}?staffFirstName=john&staffLastName=smith`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a staff member')
          expect(res.text).not.toContain('JSMITH_GEN')
          expect(res.text).toContain('There are no results for the details you have entered.')
        })
    })
  })
})

describe('POST /select-associated-staff', () => {
  it('should redirect to select staff member page with the correct search text and redirect URL intact', () => {
    return request(app)
      .post(adjudicationUrls.selectAssociatedStaff.root)
      .send({ staffFirstName: 'john', staffLastName: 'doe' })
      .expect(
        'Location',
        `${adjudicationUrls.selectAssociatedStaff.root}?staffFirstName=john&staffLastName=doe&redirectUrl=%2Foffence-code-selection%2F893%2Fcommitted%2F1-1-1%3FselectedAnswerId%3D1-1-1-3`
      )
  })

  it('should render validation messages', () => {
    return request(app)
      .post(adjudicationUrls.selectAssociatedStaff.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Select a staff member')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter the person’s name')
      })
  })
})
