import { ConfirmedOnReportData } from '../data/ConfirmedOnReportData'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import CuriousApiService from './curiousApiService'

function getNonEnglishLanguage(primaryLanguage: string): string {
  if (!primaryLanguage || primaryLanguage === 'English') {
    return null
  }
  return primaryLanguage
}

export default class ReportedAdjudicationsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly curiousApiService: CuriousApiService
  ) {}

  async getReportedAdjudication(adjudicationNumber: number, user: User): Promise<ConfirmedOnReportData> {
    const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [prisoner, secondaryLanguages, prisonerNeurodiversities] = await Promise.all([
      new PrisonApiClient(token).getPrisonerDetails(adjudicationData.reportedAdjudication.prisonerNumber),
      new PrisonApiClient(token).getSecondaryLanguages(adjudicationData.reportedAdjudication.bookingId),
      this.curiousApiService.getNeurodiversitiesForReport(adjudicationData.reportedAdjudication.prisonerNumber, token),
    ])

    const prisonerPreferredNonEnglishLanguage = getNonEnglishLanguage(prisoner.language)
    const prisonerOtherLanguages = secondaryLanguages?.map(l => l.description)

    return {
      reportExpirationDateTime: adjudicationData.reportedAdjudication.dateTimeReportExpires,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      prisonerPreferredNonEnglishLanguage,
      prisonerOtherLanguages,
      prisonerNeurodiversities,
    }
  }
}
