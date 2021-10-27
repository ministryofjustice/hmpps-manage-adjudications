import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient)

export const services = {
  userService,
  placeOnReportService,
}

export type Services = typeof services
