import { Request } from 'express'

export default class DamagesSessionService {
  addSessionDamage(req: Request, damageData: unknown, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.damages[draftAdjudicationNumber].push(damageData)
  }

  deleteSessionDamage(req: Request, index: number, draftAdjudicationNumber: number) {
    req.session.damages?.[draftAdjudicationNumber]?.splice(index - 1, 1)
  }

  deleteAllSessionDamages(req: Request, draftAdjudicationNumber: number) {
    req.session.damages?.[draftAdjudicationNumber]?.splice(0, req.session.damages?.[draftAdjudicationNumber]?.length)
  }

  setAllSessionDamages(req: Request, damageData: unknown, draftAdjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, draftAdjudicationNumber)
    req.session.damages[draftAdjudicationNumber] = damageData
  }

  getAndDeleteAllSessionDamages(req: Request, draftAdjudicationNumber: number) {
    const allSessionDamages = this.getAllSessionDamages(req, draftAdjudicationNumber)
    delete req.session.damages?.[draftAdjudicationNumber]
    return allSessionDamages
  }

  getAllSessionDamages(req: Request, draftAdjudicationNumber: number) {
    return req.session?.damages?.[draftAdjudicationNumber]
  }

  getSessionDamage(req: Request, index: number, draftAdjudicationNumber: number) {
    return req.session.damages?.[draftAdjudicationNumber][index - 1]
  }

  setReferrerOnSession(req: Request, referrer: string, adjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, adjudicationNumber)
    req.session.damages.referrer = referrer
  }

  getReferrerFromSession(req: Request) {
    return req.session.damages.referrer
  }

  deleteReferrerOnSession(req: Request) {
    delete req.session.damages.referrer
  }

  private createSessionForAdjudicationIfNotExists(req: Request, draftAdjudicationNumber: number) {
    if (!req.session.damages) {
      req.session.damages = {}
    }
    if (!req.session.damages[draftAdjudicationNumber]) {
      req.session.damages[draftAdjudicationNumber] = []
    }
  }
}
