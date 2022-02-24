import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class OffenceSessionService {
  setOffenceData(req: Request, answers: OffenceData, draftAdjudicationNumber: number) {
    if (!req.session.offenceData) {
      req.session.offenceData = {}
    }
    req.session.offenceData[draftAdjudicationNumber] = answers
  }

  getOffenceData(req: Request, draftAdjudicationNumber: number): OffenceData {
    return req.session.offenceData?.[draftAdjudicationNumber]
  }

  getAndDeleteOffenceData(req: Request, draftAdjudicationNumber: number): OffenceData {
    const offenceData = this.getOffenceData(req, draftAdjudicationNumber)
    this.deleteOffenceData(req, draftAdjudicationNumber)
    return offenceData
  }

  deleteOffenceData(req: Request, draftAdjudicationNumber: number): OffenceData {
    const offenceData = this.getOffenceData(req, draftAdjudicationNumber)
    delete req.session.offences[draftAdjudicationNumber]
    return offenceData
  }
}
