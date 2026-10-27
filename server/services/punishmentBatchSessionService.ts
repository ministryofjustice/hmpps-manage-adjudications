import { randomUUID } from 'crypto'
import type { Request } from 'express'
import type { PunishmentBatch, PunishmentBatchItem } from '../data/PunishmentResult'
import adjudicationUrls from '../utils/urlGenerator'

const isUnanswered = (item: PunishmentBatchItem) => !item.redisId || item.askAgain

// The punishments chosen on the type page that are being given a duration and start date.
// Answered items are already in req.session.punishments; the batch only records the loop's progress.
export default class PunishmentBatchSessionService {
  start(req: Request, chargeNumber: string, items: PunishmentBatchItem[]) {
    if (!req.session.punishmentBatch) {
      req.session.punishmentBatch = {}
    }
    req.session.punishmentBatch[chargeNumber] = { items: items.map(item => ({ ...item, batchItemId: randomUUID() })) }
  }

  get(req: Request, chargeNumber: string): PunishmentBatch | undefined {
    return req.session.punishmentBatch?.[chargeNumber]
  }

  // Changing the answer asks about the punishments again. Those already saved keep their place on the
  // report and are updated when the new answers are given.
  setSameForAll(req: Request, chargeNumber: string, sameForAll: boolean) {
    const batch = this.get(req, chargeNumber)
    if (!batch) {
      return
    }
    if (batch.sameForAll !== undefined && batch.sameForAll !== sameForAll) {
      batch.items.filter(item => item.redisId).forEach(item => Object.assign(item, { askAgain: true }))
    }
    batch.sameForAll = sameForAll
  }

  // Index into batch.items of the first item without an answer
  nextUnansweredIndex(batch: PunishmentBatch): number | undefined {
    const index = batch.items.findIndex(isUnanswered)
    return index === -1 ? undefined : index
  }

  markItemAnswered(req: Request, chargeNumber: string, index: number, redisId: string) {
    const item = this.get(req, chargeNumber)?.items[index]
    if (!item) {
      return
    }
    item.redisId = redisId
    delete item.askAgain
  }

  includes(req: Request, chargeNumber: string, redisId: string): boolean {
    return !!this.get(req, chargeNumber)?.items.some(item => item.redisId === redisId)
  }

  clear(req: Request, chargeNumber: string) {
    delete req.session.punishmentBatch?.[chargeNumber]
  }

  nextUrl(req: Request, chargeNumber: string): string {
    const batch = this.get(req, chargeNumber)
    if (!batch?.items.length) {
      return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
    }
    if (batch.items.some(isUnanswered)) {
      return adjudicationUrls.punishmentDuration.urls.start(chargeNumber)
    }
    return adjudicationUrls.punishmentSchedule.urls.start(chargeNumber)
  }
}
