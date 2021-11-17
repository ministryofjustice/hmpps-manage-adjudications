import { IncidentDetails } from './DraftAdjudicationResult'

export type CompletedAdjudicationSummary = {
  dateTimeOfIncident: Date
  prisonerFirstName: string
  prisonerLastName: string
  prisonerDisplayName: string
  prisonerFriendlyName: string
  prisonerNumber: string
  adjudicationsNumber: string
  incidentDetails: IncidentDetails
}
