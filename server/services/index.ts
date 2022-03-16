import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import CuriousApiService from './curiousApiService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import PrisonerSearchService from './prisonerSearchService'
import LocationService from './locationService'
import OffenceSessionService from './offenceSessionService'
import AllOffencesSessionService from './allOffencesSessionService'
import DecisionTreeService from './decisionTreeService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient)
const curiousApiService = new CuriousApiService()
const locationService = new LocationService(hmppsAuthClient)
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  hmppsAuthClient,
  curiousApiService,
  locationService
)
const prisonerSearchService = new PrisonerSearchService(hmppsAuthClient)
const offenceSessionService = new OffenceSessionService()
const allOffencesSessionService = new AllOffencesSessionService()
const decisionTreeService = new DecisionTreeService(placeOnReportService, userService)

export const services = {
  userService,
  placeOnReportService,
  reportedAdjudicationsService,
  prisonerSearchService,
  locationService,
  offenceSessionService,
  allOffencesSessionService,
  decisionTreeService,
}

export type Services = typeof services
