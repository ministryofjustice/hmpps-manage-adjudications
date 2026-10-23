import { randomUUID } from 'crypto'
import { Request } from 'express'
import HmppsAuthClient from '../data/hmppsAuthClient'
import {
  ActivePunishment,
  NotCompletedOutcome,
  PunishmentComment,
  PunishmentData,
  PunishmentBatch,
  PunishmentBatchItem,
  PunishmentDataWithSchedule,
  PunishmentReasonForChange,
  PunishmentType,
  RehabBatch,
  RehabilitativeActivity,
  SuspendedPunishmentDetails,
  SuspendedPunishmentResult,
  punishmentChangeReasonAndDetails,
} from '../data/PunishmentResult'
import {
  ReportedAdjudication,
  ReportedAdjudicationResult,
  ReportedAdjudicationStatus,
} from '../data/ReportedAdjudicationResult'
import ManageAdjudicationsSystemTokensClient, {
  ConsecutiveAdditionalDaysReport,
} from '../data/manageAdjudicationsSystemTokensClient'
import PrisonApiClient from '../data/prisonApiClient'
import { convertToTitleCase, formatTimestampTo, getFormattedOfficerName } from '../utils/utils'
import PrisonerResult from '../data/prisonerResult'
import adjudicationUrls from '../utils/urlGenerator'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

export interface SuspendedPunishmentDetailsWithStatus extends SuspendedPunishmentDetails {
  status: ReportedAdjudicationStatus
}

export interface ActivityDetails {
  prisonerName: string
  completed?: string
  outcome?: NotCompletedOutcome
  activities: RehabilitativeActivity[]
  daysToActivate?: number
  suspendedUntil?: string
  actualDays: number
}

const isUnanswered = (item: PunishmentBatchItem) => !item.redisId || item.askAgain

export default class PunishmentsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient,
  ) {}

  private createSessionForAdjudicationPunishmentIfNotExists(req: Request, chargeNumber: string) {
    if (!req.session.punishments) {
      req.session.punishments = {}
    }
    if (!req.session.punishments[chargeNumber]) {
      req.session.punishments[chargeNumber] = []
    }
  }

  private createSessionForPunishmentChangeIfNotExists(req: Request, chargeNumber: string) {
    if (!req.session.punishmentReasonForChange) {
      req.session.punishmentReasonForChange = {}
    }
    if (!req.session.punishmentReasonForChange[chargeNumber]) {
      req.session.punishmentReasonForChange[chargeNumber] = {}
    }
  }

  private async getReportedAdjudication(chargeNumber: string, user: User): Promise<ReportedAdjudication> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const { reportedAdjudication } = await new ManageAdjudicationsSystemTokensClient(
      token,
      user,
    ).getReportedAdjudication(chargeNumber)
    return reportedAdjudication
  }

  async addSessionPunishment(req: Request, punishmentData: PunishmentData, chargeNumber: string): Promise<string> {
    this.createSessionForAdjudicationPunishmentIfNotExists(req, chargeNumber)
    const redisId = randomUUID()
    const newPunishment = { ...punishmentData, redisId }
    await req.session.punishments[chargeNumber].push(newPunishment)

    return redisId
  }

  updateSessionPunishment(req: Request, punishmentData: PunishmentData, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    const updatedPunishment = {
      ...punishmentData,
      isThereRehabilitativeActivities: punishment.isThereRehabilitativeActivities,
      hasRehabilitativeActivitiesDetails: punishment.hasRehabilitativeActivitiesDetails,
      rehabilitativeActivities: punishment.rehabilitativeActivities,
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  noRehabilitativeActivities(req: Request, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: false,
      // no details are held any more, so the punishment can be changed again
      hasRehabilitativeActivitiesDetails: false,
      rehabilitativeActivities: [],
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  addEmptyRehabilitativeActivities(req: Request, chargeNumber: string, redisId: string, numberOfActivities: number) {
    const activities = [] as RehabilitativeActivity[]
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i < numberOfActivities; i++) {
      activities.push({ sessionId: i })
    }

    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: false,
      rehabilitativeActivities: activities,
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  removeAnyRehabilitativeActivities(req: Request, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: [],
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  addRehabilitativeActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    currentActivityNumber: number,
    activityDetails: RehabilitativeActivity,
  ) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)

    const updatedRehabActivityList = [...punishment.rehabilitativeActivities, activityDetails]

    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: updatedRehabActivityList,
      currentActivityNumber,
      redisId,
      id: punishment.id,
    }
    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  removeRehabilitativeActivity(req: Request, chargeNumber: string, redisId: string, sessionId: number) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)

    const updatedRehabActivityList = punishment.rehabilitativeActivities.filter(
      (ra: RehabilitativeActivity) => ra.sessionId !== sessionId,
    )

    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: updatedRehabActivityList,
      currentActivityNumber: sessionId,
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  editRehabilitativeActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    sessionId: number,
    activityDetails: RehabilitativeActivity,
  ) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)

    // keep the activity in its place in the list
    const updatedRehabActivityList = [...punishment.rehabilitativeActivities]
    const index = updatedRehabActivityList.findIndex((ra: RehabilitativeActivity) => ra.sessionId === sessionId)
    if (index > -1) updatedRehabActivityList[index] = activityDetails
    else updatedRehabActivityList.push(activityDetails)

    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: updatedRehabActivityList,
      currentActivityNumber: sessionId,
      redisId,
      id: punishment.id,
    }

    return this.replaceSessionPunishment(req, chargeNumber, redisId, updatedPunishment)
  }

  addCompletedRehabilitativeActivity(
    req: Request,
    completed: boolean,
    outcome?: NotCompletedOutcome,
    daysToActivate?: number,
    suspendedUntil?: string,
  ) {
    req.session.rehabCompletionInformation = {
      completed,
      daysToActivate,
      suspendedUntil,
      outcome,
    }
  }

  // Swaps in the updated punishment where the old one was, so the award punishments table keeps its order
  private replaceSessionPunishment(req: Request, chargeNumber: string, redisId: string, punishment: PunishmentData) {
    const punishments = req.session.punishments[chargeNumber]
    const index = punishments.findIndex((existing: PunishmentData) => existing.redisId === redisId)
    if (index > -1) punishments[index] = punishment
    else punishments.push(punishment)
  }

  async deleteSessionPunishments(req: Request, redisId: string, chargeNumber: string) {
    // get an array of the redisIds
    const redisIdArray = req.session.punishments?.[chargeNumber].map((punishment: PunishmentData) => punishment.redisId)
    // get the index of the redisId we want to delete
    const indexOfPunishment = redisIdArray.indexOf(redisId)

    // delete the correct punishment using the index
    if (indexOfPunishment > -1) return req.session.punishments?.[chargeNumber]?.splice(indexOfPunishment, 1)
    return null
  }

  getSessionPunishment(req: Request, chargeNumber: string, redisId: string) {
    const sessionData = this.getAllSessionPunishments(req, chargeNumber)

    return sessionData.filter((punishment: PunishmentData) => punishment.redisId === redisId)[0]
  }

  getAllSessionPunishments(req: Request, chargeNumber: string) {
    return req.session?.punishments?.[chargeNumber]
  }

  setAllSessionPunishments(req: Request, punishmentData: PunishmentData[], chargeNumber: string) {
    this.createSessionForAdjudicationPunishmentIfNotExists(req, chargeNumber)

    // When we get the punishments back from the server, they've lost their redisId, so we assign new ones
    const punishments = punishmentData.map(punishment => {
      let isThereRehabilitativeActivities: boolean = null
      let hasRehabilitativeActivitiesDetails: boolean = null

      if (punishment.suspendedUntil) {
        isThereRehabilitativeActivities = punishment.rehabilitativeActivities.length > 0
        if (isThereRehabilitativeActivities) {
          hasRehabilitativeActivitiesDetails = punishment.rehabilitativeActivities.some(ra => ra.details !== null)
        }
      }
      const sessionId = 0
      const rehabilitativeActivities = punishment.rehabilitativeActivities.map(ra => {
        return { ...ra, sessionId }
      })

      return {
        ...punishment,
        rehabilitativeActivities,
        isThereRehabilitativeActivities,
        hasRehabilitativeActivitiesDetails,
        redisId: randomUUID(),
      }
    })
    req.session.punishments[chargeNumber] = punishments
  }

  deleteAllSessionPunishments(req: Request, chargeNumber: string) {
    this.clearPunishmentBatch(req, chargeNumber)
    this.clearRehabBatch(req, chargeNumber)
    delete req.session?.punishmentSuccessMessage?.[chargeNumber]
    return delete req.session?.punishments?.[chargeNumber]
  }

  // The punishments chosen on the type page that are being given a duration and start date.
  // Answered items are already in req.session.punishments; the batch only records the loop's progress.
  startPunishmentBatch(req: Request, chargeNumber: string, items: PunishmentBatchItem[]) {
    if (!req.session.punishmentBatch) req.session.punishmentBatch = {}
    req.session.punishmentBatch[chargeNumber] = { items: items.map(item => ({ ...item, batchItemId: randomUUID() })) }
  }

  getPunishmentBatch(req: Request, chargeNumber: string): PunishmentBatch {
    return req.session?.punishmentBatch?.[chargeNumber]
  }

  // Changing the answer asks about the punishments again. Those already saved keep their place on the
  // report and are updated when the new answers are given.
  setPunishmentBatchSameForAll(req: Request, chargeNumber: string, sameForAll: boolean) {
    const batch = this.getPunishmentBatch(req, chargeNumber)
    if (!batch) return
    if (batch.sameForAll !== undefined && batch.sameForAll !== sameForAll) {
      batch.items.filter(item => item.redisId).forEach(item => Object.assign(item, { askAgain: true }))
    }
    batch.sameForAll = sameForAll
  }

  // Index into batch.items of the first item without an answer, or -1
  nextUnansweredBatchItemIndex(req: Request, chargeNumber: string): number {
    const batch = this.getPunishmentBatch(req, chargeNumber)
    return batch ? batch.items.findIndex(isUnanswered) : -1
  }

  markBatchItemAnswered(req: Request, chargeNumber: string, index: number, redisId: string) {
    const item = this.getPunishmentBatch(req, chargeNumber)?.items[index]
    if (!item) return
    item.redisId = redisId
    delete item.askAgain
  }

  isInPunishmentBatch(req: Request, chargeNumber: string, redisId: string): boolean {
    return !!this.getPunishmentBatch(req, chargeNumber)?.items.some(item => item.redisId === redisId)
  }

  clearPunishmentBatch(req: Request, chargeNumber: string) {
    delete req.session?.punishmentBatch?.[chargeNumber]
  }

  nextPunishmentBatchUrl(req: Request, chargeNumber: string): string {
    const batch = this.getPunishmentBatch(req, chargeNumber)
    if (!batch?.items.length) return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
    if (batch.items.some(isUnanswered)) return adjudicationUrls.punishmentDuration.urls.start(chargeNumber)
    return adjudicationUrls.punishmentSchedule.urls.start(chargeNumber)
  }

  // The suspended punishments ticked for a rehabilitative activity condition
  startRehabBatch(req: Request, chargeNumber: string, redisIds: string[]) {
    if (!req.session.rehabBatch) req.session.rehabBatch = {}
    req.session.rehabBatch[chargeNumber] = { id: randomUUID(), redisIds: [...redisIds], completedRedisIds: [] }
  }

  // A rehabilitative activity form belongs to the batch it was shown in. One from an earlier batch, or left open
  // in another tab while a new batch was started, must not change the punishments in this one.
  isCurrentRehabBatchForm(req: Request, chargeNumber: string, redisId: string, rehabBatchId: string): boolean {
    const batch = this.getRehabBatch(req, chargeNumber)
    return !!batch && (batch.id ?? '') === (rehabBatchId ?? '') && batch.redisIds.includes(redisId)
  }

  getRehabBatch(req: Request, chargeNumber: string): RehabBatch {
    return req.session?.rehabBatch?.[chargeNumber]
  }

  // Changing the answer asks about the punishments again. Each keeps its activities until new ones are entered.
  setRehabBatchSameForAll(req: Request, chargeNumber: string, sameForAll: boolean) {
    const batch = this.getRehabBatch(req, chargeNumber)
    if (!batch) return
    if (batch.sameForAll !== undefined && batch.sameForAll !== sameForAll) batch.completedRedisIds = []
    batch.sameForAll = sameForAll
  }

  nextPendingRehabRedisId(req: Request, chargeNumber: string): string {
    const batch = this.getRehabBatch(req, chargeNumber)
    return batch?.redisIds.find(redisId => !batch.completedRedisIds.includes(redisId))
  }

  // Marks a punishment's rehabilitative questions answered. When one answer covers the whole batch,
  // its activities are copied to every other punishment in the batch and they are all complete.
  completeRehabBatchItem(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.getRehabBatch(req, chargeNumber)
    if (!batch?.redisIds.includes(redisId)) return
    if (batch.sameForAll) {
      this.copyRehabilitativeActivities(
        req,
        chargeNumber,
        redisId,
        batch.redisIds.filter(id => id !== redisId),
      )
      batch.completedRedisIds = [...batch.redisIds]
      return
    }
    if (!batch.completedRedisIds.includes(redisId)) batch.completedRedisIds.push(redisId)
  }

  // The activities entered for a punishment in the batch are held here until the last one is saved, so a
  // punishment keeps the activities it already had if staff leave part way through.
  startRehabDraft(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.getRehabBatch(req, chargeNumber)
    if (batch) batch.drafts = { ...batch.drafts, [redisId]: [] }
  }

  getRehabDraft(req: Request, chargeNumber: string, redisId: string): RehabilitativeActivity[] {
    return this.getRehabBatch(req, chargeNumber)?.drafts?.[redisId]
  }

  saveRehabDraftActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    activityNumber: number,
    activity: RehabilitativeActivity,
  ) {
    const draft = this.getRehabDraft(req, chargeNumber, redisId)
    if (draft) draft[activityNumber - 1] = activity
  }

  // Replaces the punishment's activities with those entered
  applyRehabDraft(req: Request, chargeNumber: string, redisId: string) {
    const batch = this.getRehabBatch(req, chargeNumber)
    const draft = batch?.drafts?.[redisId]
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    if (!draft || !punishment) return
    this.replaceSessionPunishment(req, chargeNumber, redisId, {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: draft.filter(Boolean),
      redisId,
      id: punishment.id,
    })
    delete batch.drafts[redisId]
  }

  isInRehabBatch(req: Request, chargeNumber: string, redisId: string): boolean {
    return !!this.getRehabBatch(req, chargeNumber)?.redisIds.includes(redisId)
  }

  clearRehabBatch(req: Request, chargeNumber: string) {
    delete req.session?.rehabBatch?.[chargeNumber]
  }

  nextRehabBatchUrl(req: Request, chargeNumber: string): string {
    const batch = this.getRehabBatch(req, chargeNumber)
    if (!batch?.redisIds.length) return adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
    const next = this.nextPendingRehabRedisId(req, chargeNumber)
    if (next) return adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start(chargeNumber, next)
    return adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start(chargeNumber)
  }

  copyRehabilitativeActivities(req: Request, chargeNumber: string, fromRedisId: string, toRedisIds: string[]) {
    const from = this.getSessionPunishment(req, chargeNumber, fromRedisId)
    if (!from) return
    toRedisIds.forEach(redisId => {
      const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
      if (!punishment) return
      Object.assign(punishment, {
        isThereRehabilitativeActivities: from.isThereRehabilitativeActivities,
        hasRehabilitativeActivitiesDetails: from.hasRehabilitativeActivitiesDetails,
        rehabilitativeActivities: from.rehabilitativeActivities.map((activity: RehabilitativeActivity) => ({
          ...activity,
          id: undefined as number,
        })),
      })
    })
  }

  // A one-off message for the success banner on the award punishments page
  setSuccessMessage(req: Request, chargeNumber: string, message: string) {
    if (!req.session.punishmentSuccessMessage) req.session.punishmentSuccessMessage = {}
    req.session.punishmentSuccessMessage[chargeNumber] = message
  }

  takeSuccessMessage(req: Request, chargeNumber: string): string {
    const message = req.session?.punishmentSuccessMessage?.[chargeNumber]
    delete req.session?.punishmentSuccessMessage?.[chargeNumber]
    return message
  }

  setReasonForChangePunishments(req: Request, reasonForChange: punishmentChangeReasonAndDetails, chargeNumber: string) {
    // delete the previously saved reason for this charge number
    this.deleteReasonForChangePunishments(req, chargeNumber)
    // recreate the session object
    this.createSessionForPunishmentChangeIfNotExists(req, chargeNumber)
    // set the new reason
    req.session.punishmentReasonForChange[chargeNumber] = reasonForChange
  }

  getReasonForChangePunishments(req: Request, chargeNumber: string) {
    return req.session?.punishmentReasonForChange?.[chargeNumber]
  }

  deleteReasonForChangePunishments(req: Request, chargeNumber: string) {
    return delete req.session?.punishmentReasonForChange?.[chargeNumber]
  }

  async createPunishmentSet(
    punishments: PunishmentData[],
    chargeNumber: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishments(chargeNumber, punishments)
  }

  async editPunishmentSet(
    punishments: PunishmentData[],
    chargeNumber: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).amendPunishments(chargeNumber, punishments)
  }

  async getPunishmentsFromServer(chargeNumber: string, user: User): Promise<PunishmentDataWithSchedule[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    return reportedAdjudication.punishments
  }

  async getPunishmentCommentsFromServer(chargeNumber: string, user: User): Promise<PunishmentComment[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    return reportedAdjudication.punishmentComments
  }

  async getSuspendedPunishmentDetails(chargeNumber: string, user: User): Promise<SuspendedPunishmentDetailsWithStatus> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsUserTokensClient(user)
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(reportedAdjudication.prisonerNumber)

    const suspendedPunishments = await manageAdjudicationsClient.getSuspendedPunishments(
      prisoner.offenderNo,
      reportedAdjudication.chargeNumber,
    )
    return {
      prisonerName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      suspendedPunishments,
      status: reportedAdjudication.status,
    }
  }

  async getRehabilitativeActivitiesCompletionDetails(
    req: Request,
    chargeNumber: string,
    punishmentId: number,
    user: User,
  ): Promise<ActivityDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(reportedAdjudication.prisonerNumber)
    const completedSessionData = req.session.rehabCompletionInformation
    const punishment = reportedAdjudication.punishments?.filter(p => p.id === punishmentId)[0]

    return {
      prisonerName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      activities: punishment.rehabilitativeActivities,
      completed: completedSessionData?.completed,
      outcome: completedSessionData?.outcome,
      daysToActivate: completedSessionData?.daysToActivate,
      suspendedUntil: completedSessionData?.suspendedUntil,
      actualDays: punishment.schedule.duration,
    }
  }

  async completeRehabilitativeActivity(
    chargeNumber: string,
    punishmentId: number,
    completed: boolean,
    user: User,
    outcome?: NotCompletedOutcome,
    daysToActivate?: number,
    suspendedUntil?: string,
  ) {
    new ManageAdjudicationsUserTokensClient(user).completeRehabilitativeActivity(
      chargeNumber,
      punishmentId,
      completed,
      outcome,
      daysToActivate,
      suspendedUntil,
    )
  }

  async getSuspendedPunishment(
    chargeNumber: string,
    punishmentId: number,
    user: User,
  ): Promise<SuspendedPunishmentResult[]> {
    const punishments = (await this.getSuspendedPunishmentDetails(chargeNumber, user)).suspendedPunishments
    return punishments.filter(punishment => punishment.punishment.id === punishmentId)
  }

  async createPunishmentComment(
    chargeNumber: string,
    punishmentComment: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishmentComment(chargeNumber, punishmentComment)
  }

  async createReasonForChangingPunishmentComment(
    chargeNumber: string,
    detailsOfChange: string,
    reasonForChange: PunishmentReasonForChange,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishmentComment(
      chargeNumber,
      detailsOfChange,
      reasonForChange,
    )
  }

  async editPunishmentComment(
    chargeNumber: string,
    id: number,
    punishmentComment: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).amendPunishmentComment(chargeNumber, id, punishmentComment)
  }

  async removePunishmentComment(chargeNumber: string, id: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).removePunishmentComment(chargeNumber, id)
  }

  async getPunishmentAvailability(
    chargeNumber: string,
    user: User,
  ): Promise<{ isIndependentAdjudicatorHearing: boolean; isAdult: boolean }> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const lastHearing = reportedAdjudication.hearings?.[reportedAdjudication.hearings.length - 1]
    return {
      isIndependentAdjudicatorHearing: lastHearing?.oicHearingType.includes('INAD') || false,
      isAdult: !reportedAdjudication.isYouthOffender,
    }
  }

  // The last day of the hearing, as YYYY-MM-DD — the date an "immediate" punishment starts
  async getLastHearingDate(chargeNumber: string, user: User): Promise<string> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const lastHearing = reportedAdjudication.hearings?.[reportedAdjudication.hearings.length - 1]
    return lastHearing?.dateTimeOfHearing ? formatTimestampTo(lastHearing.dateTimeOfHearing, 'YYYY-MM-DD') : null
  }

  async getPrisonerDetails(chargeNumber: string, user: User): Promise<PrisonerResult & { friendlyName: string }> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(reportedAdjudication.prisonerNumber)

    const enhancedResult = {
      ...prisoner,
      friendlyName:
        prisoner.firstName && prisoner.lastName
          ? convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)
          : null,
    }

    return enhancedResult
  }

  async getPossibleConsecutivePunishments(
    chargeNumber: string,
    punishmentType: PunishmentType,
    user: User,
  ): Promise<ConsecutiveAdditionalDaysReport[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    const results = await new ManageAdjudicationsUserTokensClient(user).getPossibleConsecutivePunishments(
      reportedAdjudication.prisonerNumber,
      punishmentType,
      chargeNumber,
    )
    return results.filter(report => report.punishment.consecutiveChargeNumber !== chargeNumber)
  }

  async formatPunishmentComments(reportedAdjudication: ReportedAdjudication, chargeNumber: string, user: User) {
    const { punishmentComments } = reportedAdjudication
    const usernames = new Set(punishmentComments.map(it => it.createdByUserId))
    const users = await Promise.all(
      Array.from(usernames).map(async username =>
        this.hmppsManageUsersClient.getUserFromUsername(username, user.token),
      ),
    )
    const names: { [key: string]: string } = Object.fromEntries(
      users.map(it => [it.username, getFormattedOfficerName(it.name)]),
    )

    return punishmentComments.map(comment => {
      return {
        id: comment.id,
        comment: comment.comment,
        date: formatTimestampTo(comment.dateTime, 'D MMMM YYYY'),
        time: formatTimestampTo(comment.dateTime, 'HH:mm'),
        name: names[comment.createdByUserId],
        changeLink: adjudicationUrls.punishmentComment.urls.edit(chargeNumber, comment.id),
        removeLink: adjudicationUrls.punishmentComment.urls.delete(chargeNumber, comment.id),
        isOwner: user.username === comment.createdByUserId,
        ...(comment.reasonForChange && { reasonForChange: comment.reasonForChange }),
      }
    })
  }

  async filteredPunishments(punishments: Array<PunishmentData | PunishmentDataWithSchedule>) {
    if (!punishments)
      return {
        damages: [],
        otherPunishments: [],
      }
    const damages = punishments.filter(pun => pun.type === PunishmentType.DAMAGES_OWED)
    const otherPunishments = punishments.filter(pun => pun.type !== PunishmentType.DAMAGES_OWED)
    return {
      damages,
      otherPunishments,
    }
  }

  async getActivePunishmentsByOffender(bookingId: number, user: User): Promise<ActivePunishment[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).getPrisonerActiveAdjudications(bookingId)
  }

  async getRehabActivitiesFromServer(chargeNumber: string, user: User): Promise<RehabilitativeActivity[]> {
    const punishments = await this.getPunishmentsFromServer(chargeNumber, user)
    return this.extendRehabActivities(punishments, chargeNumber)
  }

  async getRehabActivitiesFromSession(req: Request, chargeNumber: string): Promise<RehabilitativeActivity[]> {
    const punishments = await this.getAllSessionPunishments(req, chargeNumber)
    return this.extendRehabActivities(punishments, chargeNumber)
  }

  extendRehabActivities(punishments: PunishmentData[], chargeNumber: string): RehabilitativeActivity[] {
    const activities: RehabilitativeActivity[] = []
    punishments?.forEach((p: PunishmentData) => {
      p.rehabilitativeActivities?.forEach((ra: RehabilitativeActivity, i: number) => {
        activities.push({
          ...ra,
          changeUrl: adjudicationUrls.editRehabilitativeActivity.urls.start(chargeNumber, p.redisId, ra.sessionId),
          removeUrl: adjudicationUrls.removeRehabilitativeActivity.urls.start(chargeNumber, p.redisId, ra.sessionId),
          completeUrl: adjudicationUrls.completeRehabilitativeActivity.urls.start(chargeNumber, p.id),
          canChangeOrRemove: p.rehabilitativeActivitiesCompleted === undefined,
          rehabilitativeActivitiesCompleted: p.rehabilitativeActivitiesCompleted,
          rehabilitativeActivitiesNotCompletedOutcome: p.rehabilitativeActivitiesNotCompletedOutcome,
          type: p.type,
          stoppagePercentage: p.stoppagePercentage,
          privilegeType: p.privilegeType,
          otherPrivilege: p.otherPrivilege,
          multipleActivitiesNotFirst: p.rehabilitativeActivities.length > 1 && i !== 0,
          multipleActivitiesNotLast:
            p.rehabilitativeActivities.length > 1 && i !== p.rehabilitativeActivities.length - 1,
        })
      })
    })
    return activities
  }

  async getRehabActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    sessionId: number,
  ): Promise<RehabilitativeActivity> {
    const sessionPunishment = this.getSessionPunishment(req, chargeNumber, redisId)

    const rehabAct = sessionPunishment.rehabilitativeActivities.filter(
      (ra: RehabilitativeActivity) => ra.sessionId === sessionId,
    )[0]
    return {
      ...rehabAct,
      type: sessionPunishment.type,
      stoppagePercentage: sessionPunishment.stoppagePercentage,
      privilegeType: sessionPunishment.privilegeType,
      otherPrivilege: sessionPunishment.otherPrivilege,
    }
  }
}
