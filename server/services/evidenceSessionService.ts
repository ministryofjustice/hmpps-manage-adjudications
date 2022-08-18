import { Request } from 'express'

export default class EvidenceSessionService {
  addSessionEvidence(req: Request, evidenceData: unknown, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.evidence[draftAdjudicationNumber].push(evidenceData)
  }

  deleteSessionEvidence(req: Request, index: number, draftAdjudicationNumber: number) {
    req.session.evidence?.[draftAdjudicationNumber]?.splice(index - 1, 1)
  }

  deleteAllSessionEvidence(req: Request, draftAdjudicationNumber: number) {
    req.session.evidence?.[draftAdjudicationNumber]?.splice(0, req.session.evidence?.[draftAdjudicationNumber]?.length)
  }

  setAllSessionEvidence(req: Request, evidenceData: unknown, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.evidence[draftAdjudicationNumber] = evidenceData
  }

  getAndDeleteAllSessionEvidence(req: Request, draftAdjudicationNumber: number) {
    const allSessionEvidence = this.getAllSessionEvidence(req, draftAdjudicationNumber)
    delete req.session.evidence?.[draftAdjudicationNumber]
    return allSessionEvidence
  }

  getAllSessionEvidence(req: Request, draftAdjudicationNumber: number) {
    return req.session?.evidence?.[draftAdjudicationNumber]
  }

  getSessionEvidence(req: Request, index: number, draftAdjudicationNumber: number) {
    return req.session.evidence?.[draftAdjudicationNumber][index - 1]
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number) {
    if (!req.session.evidence) {
      req.session.evidence = {}
    }
    if (!req.session.evidence[draftAdjudicationNumber]) {
      req.session.evidence[draftAdjudicationNumber] = []
    }
  }
}
