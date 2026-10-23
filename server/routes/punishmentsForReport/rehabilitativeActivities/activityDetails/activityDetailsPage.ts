import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import UserService from '../../../../services/userService'
import {
  apiDateToDatePicker,
  datePickerToApi,
  formatDateForDatePicker,
  formatTimestampTo,
  hasAnyRole,
} from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm, { validateCompletionDate } from './activityDetailsValidation'
import { PunishmentData, RehabilitativeActivity, convertPunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  details?: string
  monitorName?: string
  endDate?: string
  totalSessions?: string
}

export default class rehabilitativeActivityDetailsPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  // With the toggle on (IR-1904) the details are entered for the punishments in the rehab batch:
  // the activity has to be completed by the date they are suspended until
  private isBatchJourney = (res: Response) => !!res.locals.featureToggles?.multiPrivilegePunishments

  // The punishments this activity will be recorded against — all of the batch when one answer covers them
  private coveredPunishments = (req: Request): PunishmentData[] => {
    const { chargeNumber, redisId } = req.params
    const batch = this.punishmentsService.getRehabBatch(req, chargeNumber)
    const redisIds = batch?.sameForAll && batch.redisIds.includes(redisId) ? batch.redisIds : [redisId]
    return redisIds.map(id => this.punishmentsService.getSessionPunishment(req, chargeNumber, id)).filter(Boolean)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, details, monitorName, endDate, totalSessions } = pageData
    const { numberOfActivities, currentActivityNumber } = req.query

    let caption: string = null
    let endDateHint: string = null
    let rehabBatchId: string = null
    if (this.isBatchJourney(res)) {
      rehabBatchId = this.punishmentsService.getRehabBatch(req, chargeNumber)?.id ?? ''
      const punishments = this.coveredPunishments(req)
      const latest = this.latestCompletionDate(punishments)
      if (punishments.length === 1) {
        const [punishment] = punishments
        caption = convertPunishmentType(
          punishment.type,
          punishment.stoppagePercentage,
          punishment.privilegeType,
          punishment.otherPrivilege,
        )
        if (latest) {
          endDateHint = `It must be on or before the date the punishment is suspended until, ${formatTimestampTo(latest, 'D MMMM YYYY')}.`
        }
      } else if (latest) {
        endDateHint = `It must be on or before ${formatTimestampTo(latest, 'D MMMM YYYY')}, the earliest date these punishments are suspended until.`
      }
    }

    return res.render(`pages/rehabilitativeActivityDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      caption,
      endDateHint,
      rehabBatchId,
      numberOfActivities,
      currentActivityNumber,
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      details,
      monitorName,
      endDate,
      totalSessions,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (!this.isBatchJourney(res)) return this.renderView(req, res, {})
    const activity = this.activityToShow(req, Number(req.query.currentActivityNumber))
    return this.renderView(req, res, {
      details: activity?.details,
      monitorName: activity?.monitor,
      endDate: activity?.endDate ? apiDateToDatePicker(activity.endDate) : undefined,
      totalSessions: activity?.totalSessions ? String(activity.totalSessions) : undefined,
    })
  }

  // What was entered for this activity, or else what the punishment already has, so a condition that is
  // being entered again starts from its current details
  private activityToShow = (req: Request, activityNumber: number): RehabilitativeActivity => {
    const { chargeNumber, redisId } = req.params
    const entered = this.punishmentsService.getRehabDraft(req, chargeNumber, redisId)?.[activityNumber - 1]
    if (entered) return entered
    const punishment = this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)
    const existing = punishment?.hasRehabilitativeActivitiesDetails
      ? punishment.rehabilitativeActivities?.[activityNumber - 1]
      : undefined
    return existing?.details ? existing : undefined
  }

  // The form must be for the current batch, with the activities before this one already entered
  private isExpectedForm = (req: Request, activityNumber: number): boolean => {
    const { chargeNumber, redisId } = req.params
    if (!this.punishmentsService.isCurrentRehabBatchForm(req, chargeNumber, redisId, req.body.rehabBatchId)) {
      return false
    }
    const draft = this.punishmentsService.getRehabDraft(req, chargeNumber, redisId)
    return (
      !!draft && activityNumber >= 1 && Array.from({ length: activityNumber - 1 }, (_, i) => draft[i]).every(Boolean)
    )
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { numberOfActivities, currentActivityNumber } = req.query
    const { chargeNumber, redisId } = req.params
    const { details, monitorName, endDate, totalSessions } = req.body

    if (this.isBatchJourney(res) && !this.isExpectedForm(req, Number(currentActivityNumber))) {
      return res.redirect(this.punishmentsService.nextRehabBatchUrl(req, chargeNumber))
    }

    const { friendlyName } = await this.punishmentsService.getPrisonerDetails(chargeNumber, res.locals.user)

    const error =
      validateForm({ prisonerName: friendlyName, details, monitorName, endDate, totalSessions }) ||
      (this.isBatchJourney(res) &&
        validateCompletionDate({
          endDate,
          latestDate: this.latestCompletionDate(this.coveredPunishments(req)),
          coversSeveralPunishments: this.coveredPunishments(req).length > 1,
        }))
    if (error)
      return this.renderView(req, res, {
        error,
        details,
        monitorName,
        endDate,
        totalSessions,
      })

    const activityDetails = {
      details,
      monitor: monitorName,
      endDate: endDate ? datePickerToApi(endDate) : null,
      totalSessions: totalSessions ? Number(totalSessions) : null,
      sessionId: +currentActivityNumber,
    }
    if (this.isBatchJourney(res)) {
      this.punishmentsService.saveRehabDraftActivity(
        req,
        chargeNumber,
        redisId,
        Number(currentActivityNumber),
        activityDetails,
      )
      if (currentActivityNumber === numberOfActivities) {
        this.punishmentsService.applyRehabDraft(req, chargeNumber, redisId)
        this.punishmentsService.completeRehabBatchItem(req, chargeNumber, redisId)
        return res.redirect(this.punishmentsService.nextRehabBatchUrl(req, chargeNumber))
      }
    } else {
      this.punishmentsService.addRehabilitativeActivity(
        req,
        chargeNumber,
        redisId,
        Number(currentActivityNumber),
        activityDetails,
      )
      if (currentActivityNumber === numberOfActivities) {
        return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
      }
    }
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.rehabilitativeActivityDetails.urls.start(chargeNumber, redisId),
        query: { numberOfActivities, currentActivityNumber: String(+currentActivityNumber + 1) } as ParsedUrlQuery,
      }),
    )
  }

  // The earliest suspended-until date of the punishments, YYYY-MM-DD
  private latestCompletionDate = (punishments: PunishmentData[]): string =>
    punishments
      .map(punishment => punishment.suspendedUntil)
      .filter(Boolean)
      .sort()[0]
}
