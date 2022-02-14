import { SubmittedDateTime } from '../template'
import { DecisionForm } from '../../routes/offenceCodeDecisions/decisionForm'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    journeyStartUrl: query
    returnTo: string
    nowInMinutes: number
    redirectUrl: string
    incidentDate: SubmittedDateTime
    incidentLocation: number
    originalRadioSelection: string
    sessionDecisionForms: { [key: string]; DecisionForm? }
    originalAssociatedPrisonerNumber: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
    }
  }
}
