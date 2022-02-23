import { Request } from 'express'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'

export default class AllOffencesSessionService {
  addSessionOffence(req: Request, answers: OffenceData, draftAdjudicationNumber: string) {
    if (!req.session.offences) {
      req.session.offences = {}
    }
    if (!req.session.offences[draftAdjudicationNumber]) {
      req.session.offences[draftAdjudicationNumber] = []
    }
    req.session.offences[draftAdjudicationNumber].push(answers)
  }

  deleteSessionOffence(req: Request, index: number, draftAdjudicationNumber: string) {
    req.session.offences[draftAdjudicationNumber]?.splice(index)
  }

  getSessionOffences(req: Request, draftAdjudicationNumber: string): Array<OffenceData> {
    return req.session?.offences[draftAdjudicationNumber]
  }
}
