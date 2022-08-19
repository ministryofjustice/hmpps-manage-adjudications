import { Request } from 'express'
import { EvidenceDetails } from '../data/DraftAdjudicationResult'

export default class EvidenceSessionService {
  addSessionEvidence(req: Request, evidenceData: EvidenceDetails, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.evidence[draftAdjudicationNumber].push(evidenceData)
  }

  async deleteSessionEvidence(req: Request, id: string, draftAdjudicationNumber: number) {
    const index = Number(id.substring(2))
    const evidenceType = id.substring(0, 2)

    const BaTArray = req.session.evidence?.[draftAdjudicationNumber]?.filter(
      (item: EvidenceDetails) => item.code === 'BAGGED_AND_TAGGED'
    )
    const PaVArray = req.session.evidence?.[draftAdjudicationNumber]?.filter(
      (item: EvidenceDetails) => item.code !== 'BAGGED_AND_TAGGED'
    )

    if (evidenceType === 'PV') PaVArray.splice(index - 1, 1)
    if (evidenceType === 'BT') BaTArray.splice(index - 1, 1)

    req.session.evidence[draftAdjudicationNumber] = [...BaTArray, ...PaVArray]
  }

  deleteAllSessionEvidence(req: Request, draftAdjudicationNumber: number) {
    req.session.evidence?.[draftAdjudicationNumber]?.splice(0, req.session.evidence?.[draftAdjudicationNumber]?.length)
  }

  setAllSessionEvidence(req: Request, evidenceData: EvidenceDetails[], draftAdjudicationNumber: number) {
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
