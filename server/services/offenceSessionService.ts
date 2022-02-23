import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class OffenceSessionService {
  setOffenceData(req: Request, answers: OffenceData, draftAdjudicationNumber: string) {
    if (!req.session.offenceData) {
      req.session.offenceData = {}
    }
    req.session.offenceData[draftAdjudicationNumber] = answers
  }

  getOffenceData(req: Request, draftAdjudicationNumber: string): OffenceData {
    return req.session.offenceData?.[draftAdjudicationNumber]
  }

  getAndDeleteOffenceData(req: Request, draftAdjudicationNumber: string): OffenceData {
    const offenceData = this.getOffenceData(req, draftAdjudicationNumber)
    this.setOffenceData(req, null, draftAdjudicationNumber)
    return offenceData
  }
}
