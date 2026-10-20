/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import {
  PrivilegeType,
  PunishmentBatchItem,
  PunishmentData,
  PunishmentType,
  RehabilitativeActivity,
  convertPunishmentType,
  parseHasChildUnder18,
} from '../../../../data/PunishmentResult'
import { apiDateToDatePicker, formatTimestampTo, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import validateForm, { StartMode, parseDatePickerDate } from './durationValidation'

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

type FormValues = {
  duration?: string
  startMode?: string
  startDate?: string
  suspendedUntil?: string
}

// What the page is asking about: the punishments the answers apply to and how to word the questions
type Subject = {
  punishments: PunishmentBatchItem[]
  // index into the batch of each punishment, when not editing
  batchIndexes: number[]
  heading: string
  caption?: string
}

const punishmentName = (punishment: PunishmentBatchItem) =>
  convertPunishmentType(
    punishment.type,
    punishment.stoppagePercentage,
    punishment.privilegeType,
    punishment.otherPrivilege,
  )

export default class DurationPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (
    req: Request,
    res: Response,
    subject: Subject,
    lastHearingDate: string,
    values: FormValues,
    errors: FormError[] = [],
  ): Promise<void> => {
    const { chargeNumber } = req.params
    const many = subject.punishments.length > 1

    return res.render(`pages/punishmentDuration.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors,
      heading: subject.heading,
      caption: subject.caption,
      appliesTo: many ? subject.punishments.map(punishmentName) : [],
      these: many ? 'the punishments' : 'this punishment',
      lastHearingDate: formatTimestampTo(lastHearingDate, 'D MMMM YYYY'),
      minStartDate: formatTimestampTo(lastHearingDate, 'DD/MM/YYYY'),
      ...values,
    })
  }

  // In edit mode the type page passes the (possibly changed) type in the query string
  private getEditSubject = (req: Request, punishment: PunishmentData): Subject => {
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, hasChildUnder18 } = req.query
    const changedType = PunishmentType[punishmentType as keyof typeof PunishmentType]
    const item: PunishmentBatchItem = changedType
      ? {
          type: changedType,
          privilegeType: privilegeType ? PrivilegeType[privilegeType as keyof typeof PrivilegeType] : undefined,
          otherPrivilege: otherPrivilege ? String(otherPrivilege) : undefined,
          stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : undefined,
          hasChildUnder18: parseHasChildUnder18(hasChildUnder18),
        }
      : {
          type: punishment.type,
          privilegeType: punishment.privilegeType,
          otherPrivilege: punishment.otherPrivilege,
          stoppagePercentage: punishment.stoppagePercentage,
          hasChildUnder18: punishment.hasChildUnder18,
        }
    return { punishments: [item], batchIndexes: [], heading: `${punishmentName(item)}: duration and start date` }
  }

  private getBatchSubject = (req: Request): Subject => {
    const { chargeNumber } = req.params
    const batch = this.punishmentsService.getPunishmentBatch(req, chargeNumber)
    const nextIndex = this.punishmentsService.nextUnansweredBatchItemIndex(req, chargeNumber)
    if (!batch || nextIndex === -1) return null

    if (batch.sameForAll && batch.items.length > 1) {
      const batchIndexes = batch.items.map((item, index) => (item.redisId ? -1 : index)).filter(index => index > -1)
      const punishments = batchIndexes.map(index => batch.items[index])
      return {
        punishments,
        batchIndexes,
        heading: `Duration and start date for all ${punishments.length} punishments`,
      }
    }

    const item = batch.items[nextIndex]
    return {
      punishments: [item],
      batchIndexes: [nextIndex],
      heading: `${punishmentName(item)}: duration and start date`,
      caption: batch.items.length > 1 ? `Punishment ${nextIndex + 1} of ${batch.items.length}` : null,
    }
  }

  private getSubject = (req: Request): Subject => {
    if (!this.pageOptions.isEdit()) return this.getBatchSubject(req)
    const { chargeNumber, redisId } = req.params
    const punishment = this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)
    return punishment ? this.getEditSubject(req, punishment) : null
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const subject = this.getSubject(req)
    if (!subject) return res.redirect(this.punishmentsService.nextPunishmentBatchUrl(req, chargeNumber))

    const lastHearingDate = await this.punishmentsService.getLastHearingDate(chargeNumber, user)
    if (!this.pageOptions.isEdit()) return this.renderView(req, res, subject, lastHearingDate, {})

    const punishment = this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)
    let startMode = StartMode.LATER
    if (punishment.suspendedUntil) startMode = StartMode.SUSPENDED
    else if (punishment.startDate === lastHearingDate) startMode = StartMode.IMMEDIATE
    return this.renderView(req, res, subject, lastHearingDate, {
      duration: punishment.duration ? String(punishment.duration) : '',
      startMode,
      startDate: startMode === StartMode.LATER && punishment.startDate ? apiDateToDatePicker(punishment.startDate) : '',
      suspendedUntil: punishment.suspendedUntil ? apiDateToDatePicker(punishment.suspendedUntil) : '',
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { user } = res.locals
    const values: FormValues = {
      duration: String(req.body.duration ?? '').trim(),
      startMode: req.body.startMode,
      // clear anything behind a closed reveal so nothing stale is saved
      startDate: req.body.startMode === StartMode.LATER ? req.body.startDate : '',
      suspendedUntil: req.body.startMode === StartMode.SUSPENDED ? req.body.suspendedUntil : '',
    }

    const subject = this.getSubject(req)
    if (!subject) return res.redirect(this.punishmentsService.nextPunishmentBatchUrl(req, chargeNumber))

    const [lastHearingDate, { isAdult }] = await Promise.all([
      this.punishmentsService.getLastHearingDate(chargeNumber, user),
      this.punishmentsService.getPunishmentAvailability(chargeNumber, user),
    ])
    const errors = validateForm({ ...values, punishments: subject.punishments, isYOI: !isAdult, lastHearingDate })
    if (errors.length) return this.renderView(req, res, subject, lastHearingDate, values, errors)

    const schedule = this.getSchedule(values, lastHearingDate)
    const punishmentData = (punishment: PunishmentBatchItem): PunishmentData => ({
      type: punishment.type,
      privilegeType: punishment.privilegeType || null,
      otherPrivilege: punishment.otherPrivilege || null,
      stoppagePercentage: punishment.stoppagePercentage || null,
      ...(punishment.hasChildUnder18 !== undefined && { hasChildUnder18: punishment.hasChildUnder18 }),
      ...schedule,
      rehabilitativeActivities: [] as RehabilitativeActivity[],
    })

    if (this.pageOptions.isEdit()) {
      this.punishmentsService.updateSessionPunishment(
        req,
        punishmentData(subject.punishments[0]),
        chargeNumber,
        redisId,
      )
      // only a suspended punishment can have a rehabilitative activity condition
      if (!schedule.suspendedUntil) this.punishmentsService.noRehabilitativeActivities(req, chargeNumber, redisId)
      return res.redirect(
        this.punishmentsService.isInPunishmentBatch(req, chargeNumber, redisId)
          ? adjudicationUrls.punishmentSchedule.urls.start(chargeNumber)
          : adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      )
    }

    // addSessionPunishment appends as soon as it is called, so the session keeps the order chosen
    const newRedisIds = await Promise.all(
      subject.punishments.map(punishment =>
        this.punishmentsService.addSessionPunishment(req, punishmentData(punishment), chargeNumber),
      ),
    )
    newRedisIds.forEach((newRedisId, i) =>
      this.punishmentsService.markBatchItemAnswered(req, chargeNumber, subject.batchIndexes[i], newRedisId),
    )
    return res.redirect(this.punishmentsService.nextPunishmentBatchUrl(req, chargeNumber))
  }

  private getSchedule = (values: FormValues, lastHearingDate: string) => {
    const duration = Number(values.duration)
    if (values.startMode === StartMode.SUSPENDED) {
      return { duration, suspendedUntil: parseDatePickerDate(values.suspendedUntil).format('YYYY-MM-DD') }
    }
    const start =
      values.startMode === StartMode.IMMEDIATE
        ? parseDatePickerDate(formatTimestampTo(lastHearingDate, 'DD/MM/YYYY'))
        : parseDatePickerDate(values.startDate)
    return {
      duration,
      startDate: start.format('YYYY-MM-DD'),
      // the start date is day one, so 21 days from 17 August ends on 6 September
      endDate: start
        .clone()
        .add(duration - 1, 'days')
        .format('YYYY-MM-DD'),
    }
  }
}
