import { Request } from 'express'
import { EvidenceCode, EvidenceDetails } from '../data/DraftAdjudicationResult'

export default class EvidenceSessionService {
  addSessionEvidence(req: Request, evidenceData: EvidenceDetails, id: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, id)
    if (evidenceData.code === EvidenceCode.BAGGED_AND_TAGGED) {
      return req.session.evidence[id].baggedAndTagged.push(evidenceData)
    }
    if (evidenceData.code === EvidenceCode.OTHER) {
      return req.session.evidence[id].other.push(evidenceData)
    }

    return req.session.evidence[id].photoVideo.push(evidenceData)
  }

  async deleteSessionEvidence(
    req: Request,
    index: number,
    isBaggedAndTagged: boolean,
    isOther: boolean,
    id: number | string
  ) {
    if (isBaggedAndTagged) return req.session.evidence?.[id]?.baggedAndTagged.splice(index - 1, 1)
    if (isOther) return req.session.evidence?.[id]?.other.splice(index - 1, 1)
    return req.session.evidence?.[id]?.photoVideo.splice(index - 1, 1)
  }

  deleteAllSessionEvidence(req: Request, id: number | string) {
    req.session.evidence?.[id]?.photoVideo.splice(0, req.session.evidence?.[id]?.length)
    req.session.evidence?.[id]?.baggedAndTagged.splice(0, req.session.evidence?.[id]?.length)
    req.session.evidence?.[id]?.other.splice(0, req.session.evidence?.[id]?.length)
  }

  setAllSessionEvidence(req: Request, evidenceData: EvidenceDetails[], id: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, id)
    req.session.evidence[id] = evidenceData
  }

  getAndDeleteAllSessionEvidence(req: Request, id: number | string) {
    const allSessionEvidence = this.getAllSessionEvidence(req, id)
    delete req.session.evidence?.[id]
    return allSessionEvidence
  }

  getAllSessionEvidence(req: Request, id: number | string) {
    return req.session?.evidence?.[id]
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

  private createSessionForAdjudicationIfNotExists(req: Request, id: number | string) {
    if (!req.session.evidence) {
      req.session.evidence = {}
    }
    if (!req.session.evidence[id]) {
      req.session.evidence[id] = {
        photoVideo: [],
        baggedAndTagged: [],
        other: [],
      }
    }
  }
}
