import { SubmittedDateTime } from '../template'
import { OffenceData } from '../../routes/offenceCodeDecisions/offenceData'
import { PdfFooterData, PdfHeaderData, PdfPageData } from '../../utils/pdfRenderer'
import { PdfMargins } from '../../data/gotenbergClient'

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
    // TODO - We are going to remove this - we will go to the task list or check your answers on radio edit regardless
    originalRadioSelection: string
    currentRadioSelection: string
    currentAssociatedPrisonersNumber: string
    currentAssociatedPrisonersName: string
    originalReporterUsername: string
    sessionDecisionForm: DecisionForm
    offenceData: { [key: string]; offenceData?: OffenceData }
    offences: { [key: string]; offences?: Array<OffenceData> }
    forceOffenceSelection: boolean
    damageData: { [key: string]; damageData? }
    damages: { [key: string]; damages? }
    evidenceData: { [key: string]; evidenceData? }
    evidence: { [key: string]; evidence? }
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

    interface Response {
      renderPdf(
        pageView: string,
        pageData: PdfPageData,
        headerView: string,
        headerData: PdfHeaderData,
        footerView: string,
        footerData: PdfFooterData,
        options: { filename: string; pdfMargins: PdfMargins }
      ): void
    }
  }
}
