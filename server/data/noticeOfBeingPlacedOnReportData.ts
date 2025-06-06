import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo, formatTimestampToDate, formatTimestampToTime } from '../utils/utils'
import { IncidentAndOffences } from '../services/decisionTreeService'
import logger from '../../logger'

export default class noticeOfBeingPlacedOnReportData {
  isPrisonerCopy: boolean

  chargeNumber: string

  statement: string

  prisonerDisplayName: string

  prisonerNumber: string

  nextHearingDate: string

  nextHearingTime: string

  reportingOfficer: string

  incidentLocationDescription: string

  prisonerLocationDescription: string

  incidentDate: string

  incidentTime: string

  reportedDate: string

  reportedTime: string

  offences: IncidentAndOffences

  expirationTime: string

  expirationDay: string

  prisonerFriendlyName: string

  isYouthOffender: boolean

  constructor(
    isPrisonerCopy: boolean,
    chargeNumber: string,
    confirmedOnReportData: ConfirmedOnReportData,
    offences: IncidentAndOffences,
    nextHearingDateTime: string,
    createdOnBehalfOfOfficer: string
  ) {
    this.isPrisonerCopy = isPrisonerCopy
    this.chargeNumber = chargeNumber
    this.statement = confirmedOnReportData.statement
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerFriendlyName = convertToTitleCase(
      `${confirmedOnReportData.prisonerFirstName} ${confirmedOnReportData.prisonerLastName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    logger.info(`nextHearingDateTime : ${nextHearingDateTime}`)
    if (nextHearingDateTime !== null) {
      this.nextHearingDate = formatTimestampTo(nextHearingDateTime, 'dddd D MMMM')
      this.nextHearingTime = formatTimestampTo(nextHearingDateTime, 'HH:mm')
      logger.info(`nextHearingDate : ${this.nextHearingDate}`)
      logger.info(`nextHearingTime : ${this.nextHearingTime}`)
    }
    this.reportingOfficer = !createdOnBehalfOfOfficer
      ? convertToTitleCase(confirmedOnReportData.reportingOfficer)
      : `${convertToTitleCase(confirmedOnReportData.reportingOfficer)} on behalf of ${convertToTitleCase(createdOnBehalfOfOfficer)}`
    this.incidentLocationDescription = `${confirmedOnReportData.incidentAgencyName} - ${confirmedOnReportData.incidentLocationName}`
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
    this.incidentDate = formatTimestampTo(confirmedOnReportData.incidentDate, 'dddd, D MMMM YYYY')
    this.incidentTime = formatTimestampTo(confirmedOnReportData.incidentDate, 'HH:mm')
    this.reportedDate = formatTimestampTo(confirmedOnReportData.createdDateTime, 'D MMMM YYYY')
    this.reportedTime = formatTimestampTo(confirmedOnReportData.createdDateTime, 'HH:mm')
    this.offences = offences
    this.expirationTime = formatTimestampToTime(confirmedOnReportData.reportExpirationDateTime)
    this.expirationDay = formatTimestampToDate(confirmedOnReportData.reportExpirationDateTime, 'dddd, D MMMM YYYY')
    this.isYouthOffender = confirmedOnReportData.isYouthOffender
  }
}
