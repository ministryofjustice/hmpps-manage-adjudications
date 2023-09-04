import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase } from '../utils/utils'
import { IncidentAndOffences } from '../services/decisionTreeService'

export default class prepareAndRecordAnAdjudicationHearingData {
  chargeNumber: string

  establishmentName: string

  prisonerDisplayName: string

  prisonerNumber: string

  offences: IncidentAndOffences

  isYouthOffender: boolean

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData, offences: IncidentAndOffences) {
    this.chargeNumber = chargeNumber
    this.establishmentName = confirmedOnReportData.prisonName
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.offences = offences
    this.isYouthOffender = confirmedOnReportData.isYouthOffender
  }
}
