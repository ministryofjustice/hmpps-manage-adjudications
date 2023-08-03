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
import ChartApiService from './chartApiService'
import HmppsManageUsersClient from '../data/hmppsManageUsersClient'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const hmppsManageUsersClient = new HmppsManageUsersClient()
const userService = new UserService(hmppsAuthClient, hmppsManageUsersClient)
const placeOnReportService = new PlaceOnReportService(hmppsAuthClient, hmppsManageUsersClient)
const curiousApiService = new CuriousApiService()
const chartApiService = new ChartApiService(hmppsAuthClient)
const locationService = new LocationService(hmppsAuthClient)
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  hmppsAuthClient,
  hmppsManageUsersClient,
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
const punishmentsService = new PunishmentsService(hmppsAuthClient, hmppsManageUsersClient)
const { applicationInfo } = dataAccess()

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
  applicationInfo,
  chartApiService,
}

export type Services = typeof services
