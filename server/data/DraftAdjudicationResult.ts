export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
  handoverDeadline?: string
  discoveryRadioSelected?: string
  dateTimeOfDiscovery?: string
}

export type IncidentRole = {
  roleCode?: string
  associatedPrisonersNumber?: string
  associatedPrisonersName?: string
  offenceRule?: OffenceRule
}

export type IncidentStatement = {
  statement: string
  completed?: boolean
}

export type OffenceRule = {
  paragraphDescription: string
  paragraphNumber: string
}

export type OffenceDetails = {
  offenceCode: number
  offenceRule?: OffenceRule
  victimOtherPersonsName?: string
  victimPrisonersNumber?: string
  victimStaffUsername?: string
}

export type DraftAdjudication = {
  id: number
  chargeNumber: string
  prisonerNumber: string
  startedByUserId: string
  incidentDetails: IncidentDetails
  incidentRole?: IncidentRole
  incidentStatement?: IncidentStatement
  offenceDetails?: OffenceDetails
  isYouthOffender?: boolean
  damages?: DamageDetails[]
  evidence?: EvidenceDetails[]
  witnesses?: WitnessDetails[]
  damagesSaved?: boolean
  evidenceSaved?: boolean
  witnessesSaved?: boolean
  gender?: PrisonerGender
  createdOnBehalfOfOfficer?: string
  createdOnBehalfOfReason?: string
}

export type DraftAdjudicationResult = {
  draftAdjudication: DraftAdjudication
}

export type DraftAdjudicationResultList = {
  draftAdjudications: DraftAdjudication[]
}

export type CheckYourAnswers = {
  incidentDetails: SummarySectionItems[]
  statement: string
  chargeNumber?: string
  isYouthOffender: boolean
}

type SummarySectionItems = {
  label: string
  value: string
}

export type EditedIncidentDetails = {
  dateTimeOfIncident: string
  locationId: number
  incidentRole?: IncidentRole
  removeExistingOffences?: boolean
}

export type EditIncidentRoleRequest = {
  incidentRole?: IncidentRole
  removeExistingOffences?: boolean
}

export type TaskListDetails = {
  handoverDeadline: string
  showLinkForAcceptDetails: boolean
  offenceDetailsUrl: string
  incidentStatementStatus: IncidentStatementStatus
  offenceDetailsStatus: AdjudicationSectionStatus
  damagesStatus: AdjudicationSectionStatus
  evidenceStatus: AdjudicationSectionStatus
  witnessesStatus: AdjudicationSectionStatus
}

export type PrisonerReport = CheckYourAnswers

export type ApplicableRules = {
  isYouthOffenderRule: boolean
  removeExistingOffences: boolean
}

export type IncidentStatementStatus = {
  classes: string
  text: string
}

export type AssociatedPrisoner = {
  associatedPrisonersNumber: string
  associatedPrisonersName?: string
}

export type AdjudicationSectionStatus = IncidentStatementStatus

export type DamageDetails = {
  code: DamageCode
  details: string
  reporter?: string
}

export type EvidenceDetails = {
  code: EvidenceCode
  details: string
  reporter?: string
  identifier?: string
}

export type WitnessDetails = {
  code: WitnessCode
  firstName: string
  lastName: string
  reporter?: string
}

export enum DamageCode {
  ELECTRICAL_REPAIR = 'ELECTRICAL_REPAIR',
  PLUMBING_REPAIR = 'PLUMBING_REPAIR',
  FURNITURE_OR_FABRIC_REPAIR = 'FURNITURE_OR_FABRIC_REPAIR',
  LOCK_REPAIR = 'LOCK_REPAIR',
  REDECORATION = 'REDECORATION',
  CLEANING = 'CLEANING',
  REPLACE_AN_ITEM = 'REPLACE_AN_ITEM',
}

export enum EvidenceCode {
  PHOTO = 'PHOTO',
  BODY_WORN_CAMERA = 'BODY_WORN_CAMERA',
  CCTV = 'CCTV',
  BAGGED_AND_TAGGED = 'BAGGED_AND_TAGGED',
}

export enum WitnessCode {
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  OTHER_PERSON = 'OTHER_PERSON',
}

export enum PrisonerGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}
