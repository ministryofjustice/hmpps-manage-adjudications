import { randomUUID } from 'crypto'
import type { Request } from 'express'
import type { RehabBatch, RehabilitativeActivity } from '../data/PunishmentResult'
import type PunishmentsService from './punishmentsService'
import adjudicationUrls from '../utils/urlGenerator'

// The suspended punishments ticked for a rehabilitative activity condition, and the loop's progress through them
export default class RehabBatchSessionService {
  constructor(private readonly punishmentsService: PunishmentsService) {}

  start(req: Request, chargeNumber: string, redisIds: string[]) {
    if (!req.session.rehabBatch) {
      req.session.rehabBatch = {}
    }
    req.session.rehabBatch[chargeNumber] = {
      id: randomUUID(),
      redisIds: [...redisIds],
      completedRedisIds: [],
      drafts: {},
    }
  }

  get(req: Request, chargeNumber: string): RehabBatch | undefined {
    return req.session.rehabBatch?.[chargeNumber]
  }

  // A rehabilitative activity form belongs to the batch it was shown in. One from an earlier batch, or left open
  // in another tab while a new batch was started, must not change the punishments in this one.
  isCurrentForm(req: Request, chargeNumber: string, redisId: string, rehabBatchId: string): boolean {
    const batch = this.get(req, chargeNumber)
    return !!batch && batch.id === rehabBatchId && batch.redisIds.includes(redisId)
  }

  // Changing the answer asks about the punishments again. Each keeps its activities until new ones are entered.
  // Forms shown for the old answer no longer belong to the batch, and anything half entered on them is dropped.
  setSameForAll(req: Request, chargeNumber: string, sameForAll: boolean) {
    const batch = this.get(req, chargeNumber)
    if (!batch) {
      return
    }
    if (batch.sameForAll !== undefined && batch.sameForAll !== sameForAll) {
      Object.assign(batch, { id: randomUUID(), completedRedisIds: [], drafts: {} })
    }
    batch.sameForAll = sameForAll
  }

  nextPendingRedisId(req: Request, chargeNumber: string): string | undefined {
    const batch = this.get(req, chargeNumber)
    return batch?.redisIds.find(redisId => !batch.completedRedisIds.includes(redisId))
  }

  // Marks a punishment's rehabilitative questions answered. When one answer covers the whole batch,
  // its activities are copied to every other punishment in the batch and they are all complete.
  completeItem(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.get(req, chargeNumber)
    if (!batch?.redisIds.includes(redisId)) {
      return
    }
    if (batch.sameForAll) {
      this.punishmentsService.copyRehabilitativeActivities(
        req,
        chargeNumber,
        redisId,
        batch.redisIds.filter(id => id !== redisId),
      )
      batch.completedRedisIds = [...batch.redisIds]
      return
    }
    if (!batch.completedRedisIds.includes(redisId)) {
      batch.completedRedisIds.push(redisId)
    }
  }

  // The activities entered for a punishment in the batch are held here until the last one is saved, so a
  // punishment keeps the activities it already had if staff leave part way through.
  startDraft(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.get(req, chargeNumber)
    if (batch) {
      batch.drafts[redisId] = []
    }
  }

  getDraft(req: Request, chargeNumber: string, redisId: string): RehabilitativeActivity[] | undefined {
    return this.get(req, chargeNumber)?.drafts[redisId]
  }

  saveDraftActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    activityNumber: number,
    activity: RehabilitativeActivity,
  ) {
    const draft = this.getDraft(req, chargeNumber, redisId)
    if (draft) {
      draft[activityNumber - 1] = activity
    }
  }

  // Replaces the punishment's activities with those entered
  applyDraft(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.get(req, chargeNumber)
    const draft = batch?.drafts[redisId]
    if (!draft) {
      return
    }
    this.punishmentsService.replaceRehabilitativeActivities(req, chargeNumber, redisId, draft.filter(Boolean))
    delete batch.drafts[redisId]
  }

  includes(req: Request, chargeNumber: string, redisId: string): boolean {
    return !!this.get(req, chargeNumber)?.redisIds.includes(redisId)
  }

  clear(req: Request, chargeNumber: string) {
    delete req.session.rehabBatch?.[chargeNumber]
  }

  nextUrl(req: Request, chargeNumber: string): string {
    if (!this.get(req, chargeNumber)?.redisIds.length) {
      return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
    }
    const next = this.nextPendingRedisId(req, chargeNumber)
    if (next) {
      return adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start(chargeNumber, next)
    }
    return adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start(chargeNumber)
  }
}
