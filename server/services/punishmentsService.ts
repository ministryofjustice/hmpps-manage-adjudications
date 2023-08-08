// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import HmppsAuthClient from '../data/hmppsAuthClient'
import {
  PunishmentComment,
  PunishmentDataV2,
  PunishmentDataWithSchedule,
  PunishmentDataWithScheduleV2,
  PunishmentType,
  SuspendedPunishmentDetails,
  SuspendedPunishmentResult,
} from '../data/PunishmentResult'
import {
  ReportedAdjudication,
  ReportedAdjudicationResult,
  ReportedAdjudicationResultV2,
  ReportedAdjudicationV2,
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
import config from '../config'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

export default class PunishmentsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient
  ) {}

  private createSessionForAdjudicationIfNotExists(req: Request, chargeNumber: string) {
    if (!req.session.punishments) {
      req.session.punishments = {}
    }
    if (!req.session.punishments[chargeNumber]) {
      req.session.punishments[chargeNumber] = []
    }
  }

  private async getReportedAdjudication(
    chargeNumber: string,
    user: User
  ): Promise<ReportedAdjudication | ReportedAdjudicationV2> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const { reportedAdjudication } =
      config.v2EndpointsFlag === 'true'
        ? await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudicationV2(chargeNumber)
        : await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(chargeNumber)
    return reportedAdjudication
  }

  addSessionPunishment(req: Request, punishmentData: PunishmentDataV2, chargeNumber: string) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    const newPunishment = { ...punishmentData, redisId: uuidv4() }
    return req.session.punishments[chargeNumber].push(newPunishment)
  }

  updateSessionPunishment(req: Request, punishmentData: PunishmentDataV2, chargeNumber: string, redisId: string) {
    const punishment = this.getSessionPunishment(req, chargeNumber, redisId)
    this.deleteSessionPunishments(req, redisId, chargeNumber)
    const updatedPunishment = { ...punishmentData, redisId, id: punishment.id }

    return req.session.punishments[chargeNumber].push(updatedPunishment)
  }

  async deleteSessionPunishments(req: Request, redisId: string, chargeNumber: string) {
    // get an array of the redisIds
    const redisIdArray = req.session.punishments?.[chargeNumber].map(
      (punishment: PunishmentDataV2) => punishment.redisId
    )
    // get the index of the redisId we want to delete
    const indexOfPunishment = redisIdArray.indexOf(redisId)

    // delete the correct punishment using the index
    if (indexOfPunishment > -1) return req.session.punishments?.[chargeNumber]?.splice(indexOfPunishment, 1)
    return null
  }

  getSessionPunishment(req: Request, chargeNumber: string, redisId: string) {
    const sessionData = this.getAllSessionPunishments(req, chargeNumber)

    return sessionData.filter((punishment: PunishmentDataV2) => punishment.redisId === redisId)[0]
  }

  getAllSessionPunishments(req: Request, chargeNumber: string) {
    return req.session?.punishments?.[chargeNumber]
  }

  setAllSessionPunishments(
    req: Request,
    punishmentData: PunishmentDataWithSchedule[] | PunishmentDataWithScheduleV2[],
    chargeNumber: string
  ) {
    this.createSessionForAdjudicationIfNotExists(req, chargeNumber)
    // When we get the punishments back from the server, they've lost their redisId, so we assign new ones
    const punishments = punishmentData.map(punishment => {
      return { ...punishment, redisId: uuidv4() }
    })
    req.session.punishments[chargeNumber] = punishments
  }

  deleteAllSessionPunishments(req: Request, chargeNumber: string) {
    return delete req.session?.punishments?.[chargeNumber]
  }

  async createPunishmentSet(
    punishments: PunishmentDataV2[],
    chargeNumber: string,
    user: User
  ): Promise<ReportedAdjudicationResult | ReportedAdjudicationResultV2> {
    if (config.v2EndpointsFlag === 'true') {
      return new ManageAdjudicationsUserTokensClient(user).createPunishmentsV2(chargeNumber, punishments)
    }
    return new ManageAdjudicationsUserTokensClient(user).createPunishments(chargeNumber, punishments)
  }

  async editPunishmentSet(
    punishments: PunishmentDataV2[],
    chargeNumber: string,
    user: User
  ): Promise<ReportedAdjudicationResult | ReportedAdjudicationResultV2> {
    if (config.v2EndpointsFlag === 'true') {
      return new ManageAdjudicationsUserTokensClient(user).amendPunishmentsV2(chargeNumber, punishments)
    }
    return new ManageAdjudicationsUserTokensClient(user).amendPunishments(chargeNumber, punishments)
  }

  async getPunishmentsFromServer(
    chargeNumber: string,
    user: User
  ): Promise<PunishmentDataWithSchedule[] | PunishmentDataWithScheduleV2[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    return reportedAdjudication.punishments
  }

  async getPunishmentCommentsFromServer(chargeNumber: string, user: User): Promise<PunishmentComment[]> {
    const reportedAdjudication = await this.getReportedAdjudication(chargeNumber, user)
    return reportedAdjudication.punishmentComments
  }

  async getSuspendedPunishmentDetails(chargeNumber: string, user: User): Promise<SuspendedPunishmentDetails> {
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
    userEnteredChargeNumber: number,
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
      }
    })
  }
}
