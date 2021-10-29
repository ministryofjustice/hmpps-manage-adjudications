import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import PrisonerSearchService from './prisonerSearchService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient)
const prisonerSearchService = new PrisonerSearchService(hmppsAuthClient)

export const services = {
  userService,
  placeOnReportService,
  prisonerSearchService,
}

export type Services = typeof services
