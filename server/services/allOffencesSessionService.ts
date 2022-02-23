import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class AllOffencesSessionService {
  addSessionOffence(req: Request, answers: OffenceData, draftAdjudicationNumber: number) {
    if (!req.session.offences) {
      req.session.offences = {}
    }
    if (!req.session.offences[draftAdjudicationNumber]) {
      req.session.offences[draftAdjudicationNumber] = []
    }
    req.session.offences[draftAdjudicationNumber].push(answers)
  }

  deleteSessionOffence(req: Request, index: number, draftAdjudicationNumber: number) {
    req.session.offences[draftAdjudicationNumber]?.splice(index)
  }

  deleteAllSessionOffences(req: Request, draftAdjudicationNumber: number) {
    delete req.session.offences[draftAdjudicationNumber]
  }

  getSessionOffences(req: Request, draftAdjudicationNumber: number): Array<OffenceData> {
    return req.session?.offences[draftAdjudicationNumber]
  }
}
