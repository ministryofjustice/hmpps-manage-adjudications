import { Request } from 'express'
import { WitnessDetails } from '../data/DraftAdjudicationResult'

export default class WitnessesSessionService {
  addSessionWitness(req: Request, witnessData: WitnessDetails, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.witnesses[draftAdjudicationNumber].push(witnessData)
  }

  deleteSessionWitness(req: Request, index: number, draftAdjudicationNumber: number) {
    req.session.witnesses?.[draftAdjudicationNumber]?.splice(index - 1, 1)
  }

  deleteAllSessionWitnesses(req: Request, draftAdjudicationNumber: number) {
    req.session.witnesses?.[draftAdjudicationNumber]?.splice(
      0,
      req.session.witnesses?.[draftAdjudicationNumber]?.length
    )
  }

  setAllSessionWitnesses(req: Request, witnessData: WitnessDetails[], draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.witnesses[draftAdjudicationNumber] = witnessData
  }

  getAndDeleteAllSessionWitnesses(req: Request, draftAdjudicationNumber: number) {
    const allSessionWitnesses = this.getAllSessionWitnesses(req, draftAdjudicationNumber)
    delete req.session.witnesses?.[draftAdjudicationNumber]
    return allSessionWitnesses
  }

  getAllSessionWitnesses(req: Request, draftAdjudicationNumber: number) {
    return req.session?.witnesses?.[draftAdjudicationNumber]
  }

  setReferrerOnSession(req: Request, referrer: string) {
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
    delete req.session.witnesses.submitted
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number) {
    if (!req.session.witnesses) {
      req.session.witnesses = {}
    }
    if (!req.session.witnesses[draftAdjudicationNumber]) {
      req.session.witnesses[draftAdjudicationNumber] = []
    }
  }
}
