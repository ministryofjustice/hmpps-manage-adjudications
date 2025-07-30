import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase } from '../utils/utils'

export default class adjudicationHearingContinuationData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerNumber: string

  prisonerLocationDescription: string

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData) {
    this.chargeNumber = chargeNumber
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`,
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
  }
}
