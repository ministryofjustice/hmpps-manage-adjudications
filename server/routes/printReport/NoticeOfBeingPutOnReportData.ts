import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../../utils/utils'

export default class NoticeOfBeingPutOnReportData {
  adjudicationNumber: string

  statement: string

  prisonerDisplayName: string

  prisonerNumber: string

  reportingOfficer: string

  incidentLocationDescription: string

  prisonerLocationDescription: string

  incidentDate: string

  incidentTime: string

  constructor(adjudicationNumber: string, confirmedOnReportData: ConfirmedOnReportData) {
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
  }
}
