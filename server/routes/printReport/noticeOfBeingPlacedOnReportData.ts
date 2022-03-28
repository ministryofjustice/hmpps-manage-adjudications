import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../../utils/utils'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import { IncidentAndOffences } from '../../services/decisionTreeService'

export default class noticeOfBeingPlacedOnReportData {
  adjudicationNumber: number

  statement: string

  prisonerDisplayName: string

  prisonerNumber: string

  reportingOfficer: string

  incidentLocationDescription: string

  prisonerLocationDescription: string

  incidentDate: string

  incidentTime: string

  reportedDate: string

  reportedTime: string

  incidentAndOffences: IncidentAndOffences[]

  constructor(
    adjudicationNumber: number,
    confirmedOnReportData: ConfirmedOnReportData,
    incidentAndOffences: IncidentAndOffences[] = []
  ) {
    this.adjudicationNumber = adjudicationNumber
    this.statement = confirmedOnReportData.statement
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerFirstName}, ${confirmedOnReportData.prisonerLastName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.reportingOfficer = confirmedOnReportData.reportingOfficer
    this.incidentLocationDescription = `${confirmedOnReportData.incidentAgencyName} - ${confirmedOnReportData.incidentLocationName}`
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${confirmedOnReportData.prisonerLivingUnitName}`
    this.incidentDate = formatTimestampTo(confirmedOnReportData.incidentDate, 'D MMMM YYYY')
    this.incidentTime = formatTimestampTo(confirmedOnReportData.incidentDate, 'HH:mm')
    this.reportedDate = formatTimestampTo(confirmedOnReportData.createdDateTime, 'D MMMM YYYY')
    this.reportedTime = formatTimestampTo(confirmedOnReportData.createdDateTime, 'HH:mm')
    this.incidentAndOffences = incidentAndOffences
  }
}
