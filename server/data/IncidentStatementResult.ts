import { Expose } from 'class-transformer'

type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
}

type IncidentStatement = {
  statement: number
}

export default class DraftIncidentStatement {
  @Expose()
  id: number

  @Expose()
  prisonerNumber: string

  @Expose()
  adjudicationSent: boolean

  @Expose()
  incidentDetails: IncidentDetails

  @Expose()
  incidentStatement: IncidentStatement
}
