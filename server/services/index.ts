import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import PrisonerSearchService from './prisonerSearchService'
import LocationService from './locationService'
import CompletedAdjudicationsService from './completedAdjudicationsService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient)
const reportedAdjudicationsService = new ReportedAdjudicationsService()
const prisonerSearchService = new PrisonerSearchService(hmppsAuthClient)
const locationService = new LocationService(hmppsAuthClient)
const completedAdjudicationsService = new CompletedAdjudicationsService(hmppsAuthClient)

export const services = {
  userService,
  placeOnReportService,
  reportedAdjudicationsService,
  prisonerSearchService,
  locationService,
  completedAdjudicationsService,
}

export type Services = typeof services
