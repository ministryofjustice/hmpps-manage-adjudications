// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { User } from '../data/hmppsAuthClient'
import { PunishmentData, PunishmentDataWithSchedule } from '../data/PunishmentResult'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'

export default class PunishmentsService {
  private createSessionForAdjudicationIfNotExists(req: Request, adjudicationNumber: number) {
    if (!req.session.punishments) {
      req.session.punishments = {}
    }
    if (!req.session.punishments[adjudicationNumber]) {
      req.session.punishments[adjudicationNumber] = []
    }
  }

  addSessionPunishment(req: Request, punishmentData: PunishmentData, adjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, adjudicationNumber)
    const newPunishment = { ...punishmentData, redisId: uuidv4() }
    return req.session.punishments[adjudicationNumber].push(newPunishment)
  }

  updateSessionPunishment(req: Request, punishmentData: PunishmentData, adjudicationNumber: number, redisId: string) {
    const punishment = this.getSessionPunishment(req, adjudicationNumber, redisId)
    this.deleteSessionPunishments(req, redisId, adjudicationNumber)
    const updatedPunishment = { ...punishmentData, redisId, id: punishment.id }

    return req.session.punishments[adjudicationNumber].push(updatedPunishment)
  }

  async deleteSessionPunishments(req: Request, redisId: string, adjudicationNumber: number) {
    // get an array of the redisIds
    const redisIdArray = req.session.punishments?.[adjudicationNumber].map(
      (punishment: PunishmentData) => punishment.redisId
    )
    // get the index of the redisId we want to delete
    const indexOfPunishment = redisIdArray.indexOf(redisId)

    // delete the correct punishment using the index
    if (indexOfPunishment > -1) return req.session.punishments?.[adjudicationNumber]?.splice(indexOfPunishment, 1)
    return null
  }

  getSessionPunishment(req: Request, adjudicationNumber: number, redisId: string) {
    const sessionData = this.getAllSessionPunishments(req, adjudicationNumber)

    return sessionData.filter((punishment: PunishmentData) => punishment.redisId === redisId)[0]
  }

  getAllSessionPunishments(req: Request, adjudicationNumber: number) {
    return req.session?.punishments?.[adjudicationNumber]
  }

  setAllSessionPunishments(req: Request, punishmentData: PunishmentDataWithSchedule[], adjudicationNumber: number) {
    this.createSessionForAdjudicationIfNotExists(req, adjudicationNumber)
    // When we get the punishments back from the server, they've lost their redisId, so we assign new ones
    const punishments = punishmentData.map(punishment => {
      return { ...punishment, redisId: uuidv4() }
    })
    req.session.punishments[adjudicationNumber] = punishments
  }

  deleteAllSessionPunishments(req: Request, adjudicationNumber: number) {
    return delete req.session?.punishments?.[adjudicationNumber]
  }

  async createPunishmentSet(
    punishments: PunishmentData[],
    adjudicationNumber: number,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).createPunishments(adjudicationNumber, punishments)
  }

  async editPunishmentSet(
    punishments: PunishmentData[],
    adjudicationNumber: number,
    user: User // : Promise<ReportedAdjudicationResult>
  ) {
    return new ManageAdjudicationsClient(user.token).amendPunishments(adjudicationNumber, punishments)
  }

  async getPunishmentsFromServer(adjudicationNumber: number, user: User): Promise<PunishmentDataWithSchedule[]> {
    const { reportedAdjudication } = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(
      adjudicationNumber
    )
    return reportedAdjudication.punishments
  }
}