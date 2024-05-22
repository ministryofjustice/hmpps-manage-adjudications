/* eslint-disable import/prefer-default-export */

export enum PunishmentType {
  PRIVILEGE = 'PRIVILEGE',
  EARNINGS = 'EARNINGS',
  CONFINEMENT = 'CONFINEMENT',
  REMOVAL_ACTIVITY = 'REMOVAL_ACTIVITY',
  EXCLUSION_WORK = 'EXCLUSION_WORK',
  EXTRA_WORK = 'EXTRA_WORK',
  REMOVAL_WING = 'REMOVAL_WING',
  ADDITIONAL_DAYS = 'ADDITIONAL_DAYS',
  PROSPECTIVE_DAYS = 'PROSPECTIVE_DAYS',
  CAUTION = 'CAUTION',
  DAMAGES_OWED = 'DAMAGES_OWED',
  PAYBACK = 'PAYBACK',
}

export enum PrivilegeType {
  CANTEEN = 'CANTEEN',
  FACILITIES = 'FACILITIES',
  MONEY = 'MONEY',
  TV = 'TV',
  ASSOCIATION = 'ASSOCIATION',
  GYM = 'GYM',
  OTHER = 'OTHER',
}

export enum PunishmentReasonForChange {
  APPEAL = 'APPEAL',
  CORRECTION = 'CORRECTION',
  OTHER = 'OTHER',
  GOV_OR_DIRECTOR = 'GOV_OR_DIRECTOR',
}

export enum PunishmentMeasurement {
  DAYS,
  HOURS,
}

export enum NotCompletedOutcome {
  FULL_ACTIVATE,
  PARTIAL_ACTIVATE,
  EXT_SUSPEND,
  NO_ACTION,
}

export type PunishmentData = {
  id?: number
  redisId?: string
  type: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  duration?: number
  measurement?: PunishmentMeasurement
  startDate?: string
  endDate?: string
  suspendedUntil?: string
  activatedFrom?: string
  consecutiveChargeNumber?: string
  consecutiveReportAvailable?: boolean
  damagesOwedAmount?: number
  canRemove?: boolean
  canEdit?: boolean
  rehabilitativeActivities: RehabilitativeActivity[]
  isThereRehabilitativeActivities?: boolean
  hasRehabilitativeActivitiesDetails?: boolean
  rehabilitativeActivitiesCompleted?: boolean
  rehabilitativeActivitiesNotCompletedOutcome?: NotCompletedOutcome
}

export type PunishmentSchedule = {
  duration?: number
  measurement?: PunishmentMeasurement
  startDate?: string
  endDate?: string
  suspendedUntil?: string
}

export type PunishmentDataWithSchedule = {
  redisId?: string
  id?: number
  type: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  schedule: PunishmentSchedule
  activatedFrom?: string
  consecutiveChargeNumber?: string
  consecutiveReportAvailable?: boolean
  damagesOwedAmount?: number
  canRemove?: boolean
  canEdit?: boolean
  rehabilitativeActivities: RehabilitativeActivity[]
  rehabilitativeActivitiesCompleted?: boolean
  rehabilitativeActivitiesNotCompletedOutcome?: NotCompletedOutcome
}

export type RehabilitativeActivity = {
  sessionId?: number
  id?: number
  details?: string
  monitor?: string
  totalSessions?: number
  endDate?: string
  changeUrl?: string
  removeUrl?: string
  completeUrl?: string
  canChangeOrRemove?: boolean
  type?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  rehabilitativeActivitiesCompleted?: boolean
  multipleActivitiesNotFirst?: boolean
  multipleActivitiesNotLast?: boolean
}

export interface PunishmentWithConvertedName extends PunishmentData {
  punishmentName: string
}

export interface SuspendedPunishment extends PunishmentDataWithSchedule {
  activatedBy?: string
}

export type SuspendedPunishmentResult = {
  chargeNumber: string
  corrupted: boolean
  punishment: SuspendedPunishment
}

export type SuspendedPunishmentDetails = {
  suspendedPunishments: SuspendedPunishmentResult[]
  prisonerName: string
}

export type PunishmentComment = {
  id: number
  comment: string
  createdByUserId?: string
  dateTime?: string
  reasonForChange?: PunishmentReasonForChange
}

export type punishmentChangeReasonAndDetails = {
  reasonForChange: PunishmentReasonForChange
  detailsOfChange: string
}

export function convertPrivilegeType(privilege: PrivilegeType) {
  switch (privilege) {
    case PrivilegeType.ASSOCIATION:
      return 'association'
    case PrivilegeType.CANTEEN:
      return 'canteen'
    case PrivilegeType.FACILITIES:
      return 'facilities'
    case PrivilegeType.MONEY:
      return 'money'
    case PrivilegeType.TV:
      return 'TV'
    case PrivilegeType.GYM:
      return 'gym'
    default:
      return null
  }
}

export function convertPrivilegeTypeForDIS7(privilege: PrivilegeType) {
  switch (privilege) {
    case PrivilegeType.ASSOCIATION:
      return 'association (meeting other prisoners)'
    case PrivilegeType.CANTEEN:
      return 'buying from the canteen list'
    case PrivilegeType.FACILITIES:
      return 'buying from the facilities list'
    case PrivilegeType.MONEY:
      return 'money'
    case PrivilegeType.TV:
      return 'TV'
    case PrivilegeType.GYM:
      return 'gym'
    default:
      return null
  }
}

export function convertPrivilegeDTypeDescriptionForDIS7(privilege: PrivilegeType) {
  switch (privilege) {
    case PrivilegeType.ASSOCIATION:
      return "You have lost your 'association' privilege. This means you will not be allowed time out of your cell to mix with others in your residential location."
    case PrivilegeType.CANTEEN:
      return 'You have lost your canteen privilege. You cannot buy things from the canteen list.'
    case PrivilegeType.FACILITIES:
      return 'You have lost your ‘purchase’ privilege. You cannot buy some things from the prison ‘facilities list’.'
    case PrivilegeType.MONEY:
      return 'You cannot spend money from your private cash account.'
    case PrivilegeType.TV:
      return 'Your TV will be removed from your cell.'
    case PrivilegeType.GYM:
      return "You have lost the extra gym access you had under the prison incentives scheme. You'll still be able to exercise."
    default:
      return null
  }
}

export function convertPrivilegeDTypeDescriptionForDIS7Suspended(privilege: PrivilegeType) {
  switch (privilege) {
    case PrivilegeType.ASSOCIATION:
      return 'You would lose your ‘association’ privilege. This means you would not be allowed time out of your cell to mix with others in your residential location.'
    case PrivilegeType.CANTEEN:
      return 'You would lose your canteen privilege. You would not be able to buy things from the canteen list.'
    case PrivilegeType.FACILITIES:
      return 'You would lose your ‘purchase’ privilege. You would not be able to buy some things on the prison ‘facilities list’.'
    case PrivilegeType.MONEY:
      return 'You would not be able to spend money from your private cash account.'
    case PrivilegeType.TV:
      return 'Your TV would be removed from your cell.'
    case PrivilegeType.GYM:
      return "You would lose the extra gym access you had under the prison incentives scheme. You'd still be able to exercise."
    default:
      return null
  }
}

export function convertPunishmentType(
  type: PunishmentType,
  stoppage: number,
  privilege: PrivilegeType,
  otherPrivilege: string
) {
  switch (type) {
    case PunishmentType.ADDITIONAL_DAYS:
      return 'Additional days'
    case PunishmentType.CONFINEMENT:
      return 'Cellular confinement'
    case PunishmentType.EARNINGS:
      return `Stoppage of earnings: ${stoppage}%`
    case PunishmentType.EXCLUSION_WORK:
      return 'Exclusion from associated work'
    case PunishmentType.EXTRA_WORK:
      return 'Extra work'
    case PunishmentType.PRIVILEGE:
      if (privilege === PrivilegeType.OTHER) return `Loss of ${otherPrivilege.toLowerCase()}`
      return `Loss of ${convertPrivilegeType(privilege)}`
    case PunishmentType.PROSPECTIVE_DAYS:
      return 'Prospective additional days'
    case PunishmentType.REMOVAL_ACTIVITY:
      return 'Removal from activity'
    case PunishmentType.REMOVAL_WING:
      return 'Removal from wing or unit'
    case PunishmentType.CAUTION:
      return 'Caution'
    case PunishmentType.DAMAGES_OWED:
      return 'Recovery of money for damages'
    case PunishmentType.PAYBACK:
      return 'Payback punishment'
    default:
      return null
  }
}

export function flattenPunishment(punishment: PunishmentDataWithSchedule): PunishmentData {
  const {
    id,
    redisId,
    type,
    privilegeType,
    otherPrivilege,
    stoppagePercentage,
    schedule,
    activatedFrom,
    consecutiveChargeNumber,
    consecutiveReportAvailable,
    damagesOwedAmount,
    canRemove,
    canEdit,
    rehabilitativeActivities,
  } = punishment
  const { duration, measurement, startDate, endDate, suspendedUntil } = schedule
  return {
    id,
    redisId,
    type,
    duration,
    measurement,
    canRemove,
    canEdit,
    ...(privilegeType && { privilegeType }),
    ...(otherPrivilege && { otherPrivilege }),
    ...(stoppagePercentage && { stoppagePercentage }),
    ...(suspendedUntil && { suspendedUntil }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(activatedFrom && { activatedFrom }),
    ...(consecutiveChargeNumber && { consecutiveChargeNumber }),
    ...(consecutiveReportAvailable && { consecutiveReportAvailable }),
    ...(damagesOwedAmount && { damagesOwedAmount }),
    rehabilitativeActivities,
  }
}

export function flattenPunishments(punishments: PunishmentDataWithSchedule[]): PunishmentData[] {
  if (!punishments) return null
  return punishments.map(punishment => flattenPunishment(punishment))
}

export type ActivePunishment = {
  chargeNumber: string
  punishmentType: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  duration?: number
  measurement?: PunishmentMeasurement
  startDate: string
  lastDay?: string
  amount?: number
  stoppagePercentage?: number
  activatedFrom?: string
}
