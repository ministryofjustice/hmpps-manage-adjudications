import { User } from '../data/hmppsAuthClient'

import { ConfirmedOnReportData } from '../data/ConfirmedOnReportData'

export default class ReportedAdjudicationService {
  async getReportedAdjudication(adjudicationNumber: number, user: User): Promise<ConfirmedOnReportData> {
    // const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    /* eslint-disable no-console */
    console.log(`TODO - remove ${adjudicationNumber}, ${user}`)
    return {
      reportExpirationDateTime: '2021-10-25T09:03:11',
      prisonerFirstName: 'John',
      prisonerLastName: 'Smith',
      prisonerPreferredNonEnglishLanguage: 'Spanish',
      prisonerOtherLanguages: ['German', 'French'],
      prisonerNeurodiversities: ['Cant read', 'Cant write'],
    }
  }
}
