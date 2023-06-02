import { dataAccess } from '../data'
import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import PlaceOnReportService from './placeOnReportService'
import CuriousApiService from './curiousApiService'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import PrisonerSearchService from './prisonerSearchService'
import LocationService from './locationService'
import DecisionTreeService from './decisionTreeService'
import decisionTree from '../offenceCodeDecisions/DecisionTree'
import DamagesSessionService from './damagesSessionService'
import EvidenceSessionService from './evidenceSessionService'
import WitnessesSessionService from './witnessesSessionService'
import HearingsService from './hearingsService'
import OutcomesService from './outcomesService'
import PunishmentsService from './punishmentsService'

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
const damagesSessionService = new DamagesSessionService()
const evidenceSessionService = new EvidenceSessionService()
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  decisionTree
)
const witnessesSessionService = new WitnessesSessionService()
const hearingsService = new HearingsService(hmppsAuthClient)
const outcomesService = new OutcomesService(hmppsAuthClient)
const punishmentsService = new PunishmentsService(hmppsAuthClient)

export const services = {
  userService,
  placeOnReportService,
  reportedAdjudicationsService,
  prisonerSearchService,
  locationService,
  decisionTreeService,
  damagesSessionService,
  evidenceSessionService,
  witnessesSessionService,
  hearingsService,
  outcomesService,
  punishmentsService,
}

export type Services = typeof services
