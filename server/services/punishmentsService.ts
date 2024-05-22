// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import HmppsAuthClient from '../data/hmppsAuthClient'
import {
  ActivePunishment,
  PunishmentComment,
  PunishmentData,
  PunishmentDataWithSchedule,
  PunishmentReasonForChange,
  PunishmentType,
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
import PrisonApiClient, { SanctionStatus } from '../data/prisonApiClient'
import { convertToTitleCase, formatTimestampTo, getFormattedOfficerName } from '../utils/utils'
import PrisonerResult from '../data/prisonerResult'
import logger from '../../logger'
import adjudicationUrls from '../utils/urlGenerator'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

export interface SuspendedPunishmentDetailsWithStatus extends SuspendedPunishmentDetails {
  status: ReportedAdjudicationStatus
}

export default class PunishmentsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient
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
      user
    ).getReportedAdjudication(chargeNumber)
    return reportedAdjudication
  }

  async addSessionPunishment(req: Request, punishmentData: PunishmentData, chargeNumber: string): Promise<string> {
    this.createSessionForAdjudicationPunishmentIfNotExists(req, chargeNumber)
    const redisId = uuidv4()
    const newPunishment = { ...punishmentData, redisId }
    await req.session.punishments[chargeNumber].push(newPunishment)

    return redisId
  }

  updateSessionPunishment(req: Request, punishmentData: PunishmentData, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)
    const updatedPunishment = {
      ...punishmentData,
      isThereRehabilitativeActivities: punishment.isThereRehabilitativeActivities,
      hasRehabilitativeActivitiesDetails: punishment.hasRehabilitativeActivitiesDetails,
      rehabilitativeActivities: punishment.rehabilitativeActivities,
      redisId,
      id: punishment.id,
    }

    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  noRehabilitativeActivities(req: Request, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)
    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: false,
      redisId,
      id: punishment.id,
    }

    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  addEmptyRehabilitativeActivities(req: Request, chargeNumber: string, redisId: string, numberOfActivities: number) {
    const activities = [] as RehabilitativeActivity[]
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i < numberOfActivities; i++) {
      activities.push({ sessionId: i })
    }

    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)
    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: false,
      rehabilitativeActivities: activities,
      redisId,
      id: punishment.id,
    }

    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  addRehabilitativeActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    currentActivityNumber: number,
    activityDetails: RehabilitativeActivity
  ) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)

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
    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  removeRehabilitativeActivity(req: Request, chargeNumber: string, redisId: string, sessionId: number) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)

    const updatedRehabActivityList = punishment.rehabilitativeActivities.filter(
      (ra: RehabilitativeActivity) => ra.sessionId !== sessionId
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

    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  editRehabilitativeActivity(
    req: Request,
    chargeNumber: string,
    redisId: string,
    sessionId: number,
    activityDetails: RehabilitativeActivity
  ) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)

    const updatedRehabActivityList = [
      ...punishment.rehabilitativeActivities.filter((ra: RehabilitativeActivity) => ra.sessionId !== sessionId),
      activityDetails,
    ]

    const updatedPunishment = {
      ...punishment,
      isThereRehabilitativeActivities: true,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: updatedRehabActivityList,
      currentActivityNumber: sessionId,
      redisId,
      id: punishment.id,
    }

    return req.session.punishments[chargeNumber].push(updatedPunishment)
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
        redisId: uuidv4(),
      }
    })
    req.session.punishments[chargeNumber] = punishments
  }

  deleteAllSessionPunishments(req: Request, chargeNumber: string) {
    return delete req.session?.punishments?.[chargeNumber]
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
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishments(chargeNumber, punishments)
  }

  async editPunishmentSet(
    punishments: PunishmentData[],
    chargeNumber: string,
    user: User
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
      reportedAdjudication.chargeNumber
    )
    return {
      prisonerName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      suspendedPunishments,
      status: reportedAdjudication.status,
    }
  }

  async getSuspendedPunishment(
    chargeNumber: string,
    punishmentId: number,
    user: User
  ): Promise<SuspendedPunishmentResult[]> {
    const punishments = (await this.getSuspendedPunishmentDetails(chargeNumber, user)).suspendedPunishments
    return punishments.filter(punishment => punishment.punishment.id === punishmentId)
  }

  async createPunishmentComment(
    chargeNumber: string,
    punishmentComment: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishmentComment(chargeNumber, punishmentComment)
  }

  async createReasonForChangingPunishmentComment(
    chargeNumber: string,
    detailsOfChange: string,
    reasonForChange: PunishmentReasonForChange,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createPunishmentComment(
      chargeNumber,
      detailsOfChange,
      reasonForChange
    )
  }

  async editPunishmentComment(
    chargeNumber: string,
    id: number,
    punishmentComment: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).amendPunishmentComment(chargeNumber, id, punishmentComment)
  }

  async removePunishmentComment(chargeNumber: string, id: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).removePunishmentComment(chargeNumber, id)
  }

  async checkAdditionalDaysAvailability(chargeNumber: string, user: User): Promise<boolean> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    if (!reportedAdjudication.hearings?.length) return false
    const lastHearing = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1]
    return lastHearing.oicHearingType.includes('INAD')
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
    user: User
  ): Promise<ConsecutiveAdditionalDaysReport[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    return new ManageAdjudicationsUserTokensClient(user).getPossibleConsecutivePunishments(
      reportedAdjudication.prisonerNumber,
      punishmentType,
      chargeNumber
    )
  }

  async validateChargeNumber(
    chargeNumber: string,
    type: PunishmentType,
    userEnteredChargeNumber: string,
    user: User
  ): Promise<boolean> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    if (![PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(type)) return false
    const sanctionStatus =
      type === PunishmentType.ADDITIONAL_DAYS ? SanctionStatus.IMMEDIATE : SanctionStatus.PROSPECTIVE

    try {
      const response = await new PrisonApiClient(token).validateCharge(
        userEnteredChargeNumber,
        sanctionStatus,
        reportedAdjudication.prisonerNumber
      )
      if (response) return true
      return true
    } catch (error) {
      logger.error(`Invalid charge number - ${error.status}: ${error.text}`)
      return false
    }
  }

  async formatPunishmentComments(reportedAdjudication: ReportedAdjudication, chargeNumber: string, user: User) {
    const { punishmentComments } = reportedAdjudication
    const usernames = new Set(punishmentComments.map(it => it.createdByUserId))
    const users = await Promise.all(
      Array.from(usernames).map(async username => this.hmppsManageUsersClient.getUserFromUsername(username, user.token))
    )
    const names: { [key: string]: string } = Object.fromEntries(
      users.map(it => [it.username, getFormattedOfficerName(it.name)])
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
        console.log(ra)
        activities.push({
          ...ra,
          changeUrl: adjudicationUrls.editRehabilitativeActivity.urls.start(chargeNumber, p.redisId, ra.sessionId),
          removeUrl: adjudicationUrls.removeRehabilitativeActivity.urls.start(chargeNumber, p.redisId, ra.sessionId),
          completeUrl: 'TODO',
          canChangeOrRemove: p.rehabilitativeActivitiesCompleted === undefined,
          rehabilitativeActivitiesCompleted: p.rehabilitativeActivitiesCompleted,
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
    sessionId: number
  ): Promise<RehabilitativeActivity> {
    const sessionPunishment = this.getSessionPunishment(req, chargeNumber, redisId)

    const rehabAct = sessionPunishment.rehabilitativeActivities.filter(
      (ra: RehabilitativeActivity) => ra.sessionId === sessionId
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
