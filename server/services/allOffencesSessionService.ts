import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class AllOffencesSessionService {
  addSessionOffence(req: Request, offenceData: OffenceData, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.offences[draftAdjudicationNumber] = offenceData
  }

  deleteSessionOffences(req: Request, draftAdjudicationNumber: number) {
    delete req.session.offences?.[draftAdjudicationNumber]
  }

  setSessionOffences(req: Request, offenceData: OffenceData, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.offences[draftAdjudicationNumber] = offenceData
  }

  getAndDeleteSessionOffences(req: Request, draftAdjudicationNumber: number) {
    const allSessionOffences = this.getSessionOffences(req, draftAdjudicationNumber)
    delete req.session.offences?.[draftAdjudicationNumber]
    return allSessionOffences
  }

  getSessionOffences(req: Request, draftAdjudicationNumber: number): OffenceData {
    return req.session?.offences?.[draftAdjudicationNumber]
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number) {
    if (!req.session.offences) {
      req.session.offences = {}
    }
    if (!req.session.offences[draftAdjudicationNumber]) {
      req.session.offences[draftAdjudicationNumber] = {}
    }
  }
}
