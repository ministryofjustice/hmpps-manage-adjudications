import { Request } from 'express'
import { WitnessDetails } from '../data/DraftAdjudicationResult'

export default class WitnessesSessionService {
  addSessionWitness(req: Request, witnessData: WitnessDetails, chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    req.session.witnesses[chargeNumber].push(witnessData)
  }

  deleteSessionWitness(req: Request, index: number, chargeNumber: string) {
    req.session.witnesses?.[chargeNumber]?.splice(index - 1, 1)
  }

  deleteAllSessionWitnesses(req: Request, chargeNumber: string) {
    req.session.witnesses?.[chargeNumber]?.splice(0, req.session.witnesses?.[chargeNumber]?.length)
  }

  setAllSessionWitnesses(req: Request, witnessData: WitnessDetails[], chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    req.session.witnesses[chargeNumber] = witnessData
  }

  getAndDeleteAllSessionWitnesses(req: Request, chargeNumber: string) {
    const allSessionWitnesses = this.getAllSessionWitnesses(req, chargeNumber)
    delete req.session.witnesses?.[chargeNumber]
    return allSessionWitnesses
  }

  getAllSessionWitnesses(req: Request, chargeNumber: string) {
    return req.session?.witnesses?.[chargeNumber] || []
  }

  setReferrerOnSession(req: Request, referrer: string, chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    req.session.witnesses.referrer = referrer
  }

  getReferrerFromSession(req: Request) {
    return req.session.witnesses.referrer
  }

  deleteReferrerOnSession(req: Request) {
    delete req.session.witnesses.referrer
  }

  getAndDeleteReferrerOnSession(req: Request) {
    const referrer = this.getReferrerFromSession(req)
    delete req.session.witnesses.referrer
    return referrer
  }

  setSubmittedEditFlagOnSession(req: Request) {
    req.session.witnesses.submitted = true
  }

  getSubmittedEditFlagFromSession(req: Request) {
    return req.session.witnesses.submitted
  }

  deleteSubmittedEditFlagOnSession(req: Request) {
    delete req.session.witnesses?.submitted
  }

  private createSessionForAdjudicationIfNotExists(req: Request, chargeNumber: string) {
    if (!req.session.witnesses) {
      req.session.witnesses = {}
    }
    if (!req.session.witnesses[chargeNumber]) {
      req.session.witnesses[chargeNumber] = []
    }
  }
}
