import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'

import allRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import UserService from '../../services/userService'
import * as auth from '../../authentication/auth'
import { Services } from '../../services'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import LocationService from '../../services/locationService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import EvidenceSessionService from '../../services/evidenceSessionService'
import DamagesSessionService from '../../services/damagesSessionService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import HearingsService from '../../services/hearingsService'
import OutcomesService from '../../services/outcomesService'
import PunishmentsService from '../../services/punishmentsService'

import type { ApplicationInfo } from '../../applicationInfo'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
}

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
  activeCaseLoadId: 'MDI',
  allCaseLoads: [
    {
      caseLoadId: 'MDI',
      description: 'Moorland',
      type: 'INST',
      caseloadFunction: 'TEST',
      currentlyActive: true,
    },
    {
      caseLoadId: 'LEI',
      description: 'Leeds',
      type: 'INST',
      caseloadFunction: 'TEST',
      currentlyActive: false,
    },
  ],
  activeCaseLoad: {
    caseLoadId: 'MDI',
    description: 'Moorland',
    type: 'INST',
    caseloadFunction: 'TEST',
    currentlyActive: true,
  },
}

class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string) {
    return {
      token,
      ...user,
    }
  }
}

function appSetup(route: Router, production: boolean, session: Record<string, unknown>): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, testAppInfo)

  app.use((req, res, next) => {
    res.locals = {}
    res.locals.user = user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use((req, res, next) => {
    Object.entries(session).forEach(([key, value]) => {
      req.session[key] = value
    })
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export default function appWithAllRoutes(
  { production = false }: { production?: boolean },
  overrides: Partial<Services> = {},
  session = {}
): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()

  return appSetup(
    allRoutes(standardRouter(new MockUserService()), {
      userService: new MockUserService(),
      placeOnReportService: {} as PlaceOnReportService,
      prisonerSearchService: {} as PrisonerSearchService,
      locationService: {} as LocationService,
      reportedAdjudicationsService: {} as ReportedAdjudicationsService,
      decisionTreeService: {} as DecisionTreeService,
      damagesSessionService: {} as DamagesSessionService,
      evidenceSessionService: {} as EvidenceSessionService,
      witnessesSessionService: {} as WitnessesSessionService,
      hearingsService: {} as HearingsService,
      outcomesService: {} as OutcomesService,
      punishmentsService: {} as PunishmentsService,
      applicationInfo: {} as ApplicationInfo,
      ...overrides,
    }),
    production,
    session
  )
}
