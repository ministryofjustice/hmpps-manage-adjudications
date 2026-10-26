/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { User } from '../../../../data/hmppsManageUsersClient'
import {
  PunishmentData,
  PunishmentDataWithSchedule,
  PunishmentType,
  canHaveRehabilitativeActivity,
  flattenPunishments,
} from '../../../../data/PunishmentResult'
import PunishmentsService from '../../../../services/punishmentsService'
import type PunishmentBatchSessionService from '../../../../services/punishmentBatchSessionService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import UserService from '../../../../services/userService'

export enum PageRequestType {
  PUNISHMENTS_FROM_API,
  PUNISHMENTS_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_API
  }

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_SESSION
  }
}

export default class AwardPunishmentsPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService,
    private readonly punishmentBatchSessionService: PunishmentBatchSessionService,
    private readonly rehabBatchSessionService: RehabBatchSessionService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { chargeNumber } = req.params
    const punishmentToDelete = req.query.delete || null

    const redirectAfterRemoveUrl = `${adjudicationUrls.awardPunishments.urls.modified(chargeNumber)}?delete=`

    let punishments = await this.getPunishments(req, chargeNumber, user)

    // // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData()) {
      // Set up session to allow for adding and deleting
      this.punishmentsService.setAllSessionPunishments(req, punishments, chargeNumber)
      // Now we need to show the session data instead in order to have the redisId attached
      punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    }

    if (punishmentToDelete) {
      await this.punishmentsService.deleteSessionPunishments(req, punishmentToDelete as string, chargeNumber)
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    const multiPrivilegePunishments = !!res.locals.featureToggles?.multiPrivilegePunishments
    if (multiPrivilegePunishments) {
      // Leaving a punishment or rehabilitative activity loop keeps what was answered and drops the rest
      this.punishmentBatchSessionService.clear(req, chargeNumber)
      this.rehabBatchSessionService.clear(req, chargeNumber)
    }

    // a punishment added with exactly the same details as another is usually a mistake, so ask before showing it
    if (this.pageOptions.displaySessionData()) {
      const duplicate = this.punishmentsService.getUnconfirmedDuplicate(req, chargeNumber)
      if (duplicate) {
        return res.redirect(
          adjudicationUrls.punishmentAlreadyAdded.urls.start(chargeNumber, duplicate.punishment.redisId),
        )
      }
    }

    // taken after the duplicate question, so the banner is still there when staff come back from it
    const successMessage = multiPrivilegePunishments
      ? this.punishmentsService.takeSuccessMessage(req, chargeNumber)
      : null

    const continueHref = await this.getContinueHref(chargeNumber, user)

    const filteredPunishments = await this.punishmentsService.filteredPunishments(punishments)

    const cautionAdded = await this.hasCautionBeenAdded(punishments)
    const rehabActivities = await this.punishmentsService.getRehabActivitiesFromSession(req, chargeNumber)

    return res.render(`pages/awardPunishments.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      redirectAfterRemoveUrl,
      chargeNumber,
      punishments,
      filteredPunishments,
      cautionAdded,
      continueHref,
      rehabActivities,
      successMessage,
      canAddRehabilitativeActivity:
        multiPrivilegePunishments && (await this.canAddRehabilitativeActivity(chargeNumber, user, punishments)),
    })
  }

  canAddRehabilitativeActivity = async (chargeNumber: string, user: User, punishments: PunishmentData[]) => {
    if (!punishments?.some(punishment => canHaveRehabilitativeActivity(punishment))) return false
    const { isIndependentAdjudicatorHearing } = await this.punishmentsService.getPunishmentAvailability(
      chargeNumber,
      user,
    )
    // only a governor can award a rehabilitative activity condition
    return !isIndependentAdjudicatorHearing
  }

  getPunishments = async (req: Request, chargeNumber: string, user: User) => {
    if (this.pageOptions.displaySessionData()) {
      return this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    }
    const punishments = await this.punishmentsService.getPunishmentsFromServer(chargeNumber, user)
    return flattenPunishments(punishments)
  }

  getContinueHref = async (chargeNumber: string, user: User) => {
    const punishments = await this.punishmentsService.getPunishmentsFromServer(chargeNumber, user)
    if (punishments && punishments.length) return adjudicationUrls.reasonForChangePunishment.urls.start(chargeNumber)
    return adjudicationUrls.checkPunishments.urls.start(chargeNumber)
  }

  hasCautionBeenAdded = async (punishments: PunishmentDataWithSchedule[]) => {
    if (!punishments) return false
    return !!punishments.filter(pun => pun.type === PunishmentType.CAUTION).length
  }
}
