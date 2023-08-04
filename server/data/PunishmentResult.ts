/* eslint-disable import/prefer-default-export */

import config from '../config'

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
  OTHER = 'OTHER',
}

/**
 * @deprecated The method should not be used
 */
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
  activatedFrom?: number
  consecutiveReportNumber?: number
}

export type PunishmentDataV2 = {
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
  activatedFrom?: number
  consecutiveReportNumber?: number
  damagesOwedAmount?: number
}

export type PunishmentSchedule = {
  days: number
  startDate?: string
  endDate?: string
  suspendedUntil?: string
}

/**
 * @deprecated The method should not be used
 */
export type PunishmentDataWithSchedule = {
  redisId?: string
  id?: number
  type: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  schedule: PunishmentSchedule
  activatedFrom?: number
  consecutiveReportNumber?: number
  consecutiveReportAvailable?: boolean
}

export type PunishmentDataWithScheduleV2 = {
  redisId?: string
  id?: number
  type: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  schedule: PunishmentSchedule
  activatedFrom?: number
  consecutiveReportNumber?: number
  amount?: number
}

export interface SuspendedPunishment extends PunishmentDataWithSchedule {
  activatedBy?: number
}

export type SuspendedPunishmentResult = {
  reportNumber: number
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
    consecutiveReportNumber,
    consecutiveReportAvailable,
  } = punishment
  const { days, startDate, endDate, suspendedUntil } = schedule
  return {
    id,
    redisId,
    type,
    days,
    ...(privilegeType && { privilegeType }),
    ...(otherPrivilege && { otherPrivilege }),
    ...(stoppagePercentage && { stoppagePercentage }),
    ...(suspendedUntil && { suspendedUntil }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(activatedFrom && { activatedFrom }),
    ...(consecutiveReportNumber && { consecutiveReportNumber }),
    ...(consecutiveReportAvailable && { consecutiveReportAvailable }),
  }
}

export function flattenPunishmentV2(punishment: PunishmentDataWithScheduleV2): PunishmentDataV2 {
  const {
    id,
    redisId,
    type,
    privilegeType,
    otherPrivilege,
    stoppagePercentage,
    schedule,
    activatedFrom,
    consecutiveReportNumber,
    amount,
  } = punishment
  const { days, startDate, endDate, suspendedUntil } = schedule
  return {
    id,
    redisId,
    type,
    days,
    ...(privilegeType && { privilegeType }),
    ...(otherPrivilege && { otherPrivilege }),
    ...(stoppagePercentage && { stoppagePercentage }),
    ...(suspendedUntil && { suspendedUntil }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(activatedFrom && { activatedFrom }),
    ...(consecutiveReportNumber && { consecutiveReportNumber }),
    ...(amount && { amount }),
  }
}

export function flattenPunishments(
  punishments: PunishmentDataWithSchedule[] | PunishmentDataWithScheduleV2[]
): PunishmentData[] | PunishmentDataV2 {
  if (!punishments) return null
  if (config.v2EndpointsFlag === 'true') {
    return punishments.map(punishment => flattenPunishmentV2(punishment))
  }
  return punishments.map(punishment => flattenPunishment(punishment))
}
