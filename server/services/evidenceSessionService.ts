import { Request } from 'express'
import { EvidenceDetails } from '../data/DraftAdjudicationResult'

export default class EvidenceSessionService {
  addSessionEvidence(req: Request, evidenceData: EvidenceDetails, draftAdjudicationNumber: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    if (evidenceData.code === 'BAGGED_AND_TAGGED') {
      return req.session.evidence[draftAdjudicationNumber].baggedAndTagged.push(evidenceData)
    }

    return req.session.evidence[draftAdjudicationNumber].photoVideo.push(evidenceData)
  }

  async deleteSessionEvidence(
    req: Request,
    index: number,
    isBaggedAndTagged: boolean,
    draftAdjudicationNumber: number | string
  ) {
    if (isBaggedAndTagged) return req.session.evidence?.[draftAdjudicationNumber]?.baggedAndTagged.splice(index - 1, 1)
    return req.session.evidence?.[draftAdjudicationNumber]?.photoVideo.splice(index - 1, 1)
  }

  deleteAllSessionEvidence(req: Request, draftAdjudicationNumber: number | string) {
    req.session.evidence?.[draftAdjudicationNumber]?.photoVideo.splice(
      0,
      req.session.evidence?.[draftAdjudicationNumber]?.length
    )
    req.session.evidence?.[draftAdjudicationNumber]?.baggedAndTagged.splice(
      0,
      req.session.evidence?.[draftAdjudicationNumber]?.length
    )
  }

  setAllSessionEvidence(req: Request, evidenceData: EvidenceDetails[], draftAdjudicationNumber: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.evidence[draftAdjudicationNumber] = evidenceData
  }

  getAndDeleteAllSessionEvidence(req: Request, draftAdjudicationNumber: number | string) {
    const allSessionEvidence = this.getAllSessionEvidence(req, draftAdjudicationNumber)
    delete req.session.evidence?.[draftAdjudicationNumber]
    return allSessionEvidence
  }

  getAllSessionEvidence(req: Request, draftAdjudicationNumber: number | string) {
    return req.session?.evidence?.[draftAdjudicationNumber]
  }

  setReferrerOnSession(req: Request, referrer: string, chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    req.session.evidence.referrer = referrer
  }

  getReferrerFromSession(req: Request) {
    return req.session.evidence.referrer
  }

  getAndDeleteReferrerOnSession(req: Request) {
    const referrer = this.getReferrerFromSession(req)
    delete req.session.evidence.referrer
    return referrer
  }

  deleteReferrerOnSession(req: Request) {
    delete req.session.evidence.referrer
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number | string) {
    if (!req.session.evidence) {
      req.session.evidence = {}
    }
    if (!req.session.evidence[draftAdjudicationNumber]) {
      req.session.evidence[draftAdjudicationNumber] = {
        photoVideo: [],
        baggedAndTagged: [],
      }
    }
  }
}
