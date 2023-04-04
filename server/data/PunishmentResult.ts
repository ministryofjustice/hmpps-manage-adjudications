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
}

export enum PrivilegeType {
  CANTEEN = 'CANTEEN',
  FACILITIES = 'FACILITIES',
  MONEY = 'MONEY',
  TV = 'TV',
  ASSOCIATION = 'ASSOCIATION',
  OTHER = 'OTHER',
}

export type PunishmentData = {
  id?: number
  redisId?: string
  type: PunishmentType
  privilegeType: PrivilegeType
  otherPrivilege: string
  stoppagePercentage: number
  days: number
  startDate: string
  endDate: string
  suspendedUntil: string
}

export type PunishmentSchedule = {
  days: number
  startDate: string
  endDate: string
  suspendedUntil: string
}

export type PunishmentDataWithSchedule = {
  id?: number
  type: PunishmentType
  privilegeType: PrivilegeType
  otherPrivilege: string
  stoppagePercentage: number
  schedule: PunishmentSchedule
}
