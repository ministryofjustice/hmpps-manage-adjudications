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

export type PunishmentData = {
  id?: number
  redisId?: string
  type: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  days: number
  startDate?: string
  endDate?: string
  suspendedUntil?: string
  activatedFrom?: string
  consecutiveChargeNumber?: string
  consecutiveReportAvailable?: boolean
  damagesOwedAmount?: number
  canRemove?: boolean
}

export type PunishmentSchedule = {
  days: number
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
}

export interface SuspendedPunishment extends PunishmentDataWithSchedule {
  activatedBy?: string
}

export type SuspendedPunishmentResult = {
  chargeNumber: string
  punishment: SuspendedPunishment
}

export type SuspendedPunishmentDetails = {
  suspendedPunishments: SuspendedPunishmentResult[]
  prisonerName: string
}

export type PunishmentComment = {
  id: number
  comment: string
  createdByUserId: string
  dateTime: string
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
  } = punishment
  const { days, startDate, endDate, suspendedUntil } = schedule
  return {
    id,
    redisId,
    type,
    days,
    canRemove,
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
  }
}

export function flattenPunishments(punishments: PunishmentDataWithSchedule[]): PunishmentData[] {
  if (!punishments) return null
  return punishments.map(punishment => flattenPunishment(punishment))
}
