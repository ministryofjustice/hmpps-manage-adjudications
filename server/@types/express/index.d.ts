import { SubmittedDateTime } from '../template'
import { DecisionForm } from '../../routes/offenceCodeDecisions/decisionForm'
import { DecisionAnswers } from '../../routes/offenceCodeDecisions/decisionAnswers'

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
    originalAssociatedPrisonerNumber: string
    decisionForms: { [key: string]; decisionForm?: DecisionForm }
    decisionAnswers: { [key: string]; decisionAnswers?: DecisionAnswers }
    offences: { [key: string]; offences?: Array<DecisionAnswers> }
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
