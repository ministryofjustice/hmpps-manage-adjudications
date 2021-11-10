import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import PrisonerSearchService from './prisonerSearchService'
import LocationService from './locationService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient)
const reportedAdjudicationsService = new ReportedAdjudicationsService(hmppsAuthClient)
const prisonerSearchService = new PrisonerSearchService(hmppsAuthClient)
const locationService = new LocationService(hmppsAuthClient)

export const services = {
  userService,
  placeOnReportService,
  reportedAdjudicationsService,
  prisonerSearchService,
  locationService,
}

export type Services = typeof services
