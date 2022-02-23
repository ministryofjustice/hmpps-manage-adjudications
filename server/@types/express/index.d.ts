import { SubmittedDateTime } from '../template'
import { OffenceData } from '../../routes/offenceCodeDecisions/offenceData'

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
    sessionDecisionForm: DecisionForm
    originalAssociatedPrisonersNumber: string
    offenceData: { [key: string]; offenceData?: OffenceData }
    offences: { [key: string]; offences?: Array<OffenceData> }
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
