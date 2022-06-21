import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo, formatTimestampToDate, formatTimestampToTime } from '../utils/utils'
import { IncidentAndOffences } from '../services/decisionTreeService'

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

  offences: IncidentAndOffences[]

  expirationTime: string

  expirationDay: string

  prisonerFriendlyName: string

  isYouthOffender: boolean

  constructor(
    adjudicationNumber: number,
    confirmedOnReportData: ConfirmedOnReportData,
    offences: IncidentAndOffences[] = []
  ) {
    this.adjudicationNumber = adjudicationNumber
    this.statement = confirmedOnReportData.statement
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerFriendlyName = convertToTitleCase(
      `${confirmedOnReportData.prisonerFirstName} ${confirmedOnReportData.prisonerLastName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.reportingOfficer = convertToTitleCase(confirmedOnReportData.reportingOfficer)
    this.incidentLocationDescription = `${confirmedOnReportData.incidentAgencyName} - ${confirmedOnReportData.incidentLocationName}`
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${confirmedOnReportData.prisonerLivingUnitName}`
    this.incidentDate = formatTimestampTo(confirmedOnReportData.incidentDate, 'D MMMM YYYY')
    this.incidentTime = formatTimestampTo(confirmedOnReportData.incidentDate, 'HH:mm')
    this.reportedDate = formatTimestampTo(confirmedOnReportData.createdDateTime, 'D MMMM YYYY')
    this.reportedTime = formatTimestampTo(confirmedOnReportData.createdDateTime, 'HH:mm')
    this.offences = offences
    this.expirationTime = formatTimestampToTime(confirmedOnReportData.reportExpirationDateTime)
    this.expirationDay = formatTimestampToDate(confirmedOnReportData.reportExpirationDateTime, 'dddd D MMMM')
    this.isYouthOffender = confirmedOnReportData.isYouthOffender
  }
}
