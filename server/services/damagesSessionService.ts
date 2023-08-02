import { Request } from 'express'

export default class DamagesSessionService {
  addSessionDamage(req: Request, damageData: unknown, id: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, id)
    req.session.damages[id].push(damageData)
  }

  deleteSessionDamage(req: Request, index: number, id: number | string) {
    req.session.damages?.[id]?.splice(index - 1, 1)
  }

  deleteAllSessionDamages(req: Request, id: number | string) {
    req.session.damages?.[id]?.splice(0, req.session.damages?.[id]?.length)
  }

  setAllSessionDamages(req: Request, damageData: unknown, id: number | string) {
    this.createSessionForAdjudicationIfNotExists(req, id)
    req.session.damages[id] = damageData
  }

  getAndDeleteAllSessionDamages(req: Request, id: number | string) {
    const allSessionDamages = this.getAllSessionDamages(req, id)
    delete req.session.damages?.[id]
    return allSessionDamages
  }

  getAllSessionDamages(req: Request, id: number | string) {
    return req.session?.damages?.[id]
  }

  getSessionDamage(req: Request, index: number, id: number) {
    return req.session.damages?.[id][index - 1]
  }

  setReferrerOnSession(req: Request, referrer: string, chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    req.session.damages.referrer = referrer
  }

  getReferrerFromSession(req: Request) {
    return req.session.damages.referrer
  }

  getAndDeleteReferrerOnSession(req: Request) {
    const referrer = this.getReferrerFromSession(req)
    delete req.session.damages.referrer
    return referrer
  }

  deleteReferrerOnSession(req: Request) {
    delete req.session.damages.referrer
  }

  private createSessionForAdjudicationIfNotExists(req: Request, id: number | string) {
    if (!req.session.damages) {
      req.session.damages = {}
    }
    if (!req.session.damages[id]) {
      req.session.damages[id] = []
    }
  }
}
