import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase } from '../utils/utils'

export default class adjudicationHistoryForCurrentSentenceData {
  chargeNumber: string

  establishmentName: string

  prisonerDisplayName: string

  prisonerNumber: string

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData) {
    this.chargeNumber = chargeNumber
    this.establishmentName = confirmedOnReportData.incidentLocationName
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
  }
}
