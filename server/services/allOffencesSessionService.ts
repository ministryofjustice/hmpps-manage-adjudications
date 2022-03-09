import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class AllOffencesSessionService {
  addSessionOffence(req: Request, offenceData: OffenceData, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.offences[draftAdjudicationNumber].push(offenceData)
  }

  deleteSessionOffence(req: Request, index: number, draftAdjudicationNumber: number) {
    req.session.offences?.[draftAdjudicationNumber]?.splice(index - 1, 1)
  }

  setAllSessionOffences(req: Request, offenceData: OffenceData[], draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.offences[draftAdjudicationNumber] = offenceData
  }

  getAndDeleteAllSessionOffences(req: Request, draftAdjudicationNumber: number) {
    const allSessionOffences = this.getAllSessionOffences(req, draftAdjudicationNumber)
    delete req.session.offences?.[draftAdjudicationNumber]
    return allSessionOffences
  }

  getAllSessionOffences(req: Request, draftAdjudicationNumber: number): OffenceData[] {
    return req.session?.offences?.[draftAdjudicationNumber]
  }

  getSessionOffence(req: Request, index: number, draftAdjudicationNumber: number): OffenceData {
    return req.session.offences?.[draftAdjudicationNumber][index - 1]
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number) {
    if (!req.session.offences) {
      req.session.offences = {}
    }
    if (!req.session.offences[draftAdjudicationNumber]) {
      req.session.offences[draftAdjudicationNumber] = []
    }
  }
}
