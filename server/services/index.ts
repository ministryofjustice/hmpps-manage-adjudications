import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import CuriousApiService from './curiousApiService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import PrisonerSearchService from './prisonerSearchService'
import LocationService from './locationService'
import AllOffencesSessionService from './allOffencesSessionService'
import DecisionTreeService from './decisionTreeService'
import decisionTree from '../offenceCodeDecisions/DecisionTree'
import DamagesSessionService from './damagesSessionService'
import EvidenceSessionService from './evidenceSessionService'
import WitnessesSessionService from './witnessesSessionService'

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
const allOffencesSessionService = new AllOffencesSessionService()
const damagesSessionService = new DamagesSessionService()
const evidenceSessionService = new EvidenceSessionService()
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  decisionTree
)
const witnessesSessionService = new WitnessesSessionService()

export const services = {
  userService,
  placeOnReportService,
  reportedAdjudicationsService,
  prisonerSearchService,
  locationService,
  allOffencesSessionService,
  decisionTreeService,
  damagesSessionService,
  evidenceSessionService,
  witnessesSessionService,
}

export type Services = typeof services
