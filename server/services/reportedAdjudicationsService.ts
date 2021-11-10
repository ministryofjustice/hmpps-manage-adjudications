import moment from 'moment'
import { ConfirmedOnReportData } from '../data/ConfirmedOnReportData'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import CuriousApiService from './curiousApiService'

function calculateExpirationTime(datetimeOfIncident: string): string {
  const incidentDateTime = moment(datetimeOfIncident)
  // TODO - add Sundays/bank Holidays calcs
  const expirationTime = incidentDateTime.add(2, 'days')
  return expirationTime.format('YYYY-MM-DDTHH:mm')
}

export default class ReportedAdjudicationsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly curiousApiService: CuriousApiService
  ) {}

  async getReportedAdjudication(adjudicationNumber: number, user: User): Promise<ConfirmedOnReportData> {
    const adjudicationData = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    const reportExpirationDateTime = calculateExpirationTime(
      adjudicationData.reportedAdjudication.incidentDetails.dateTimeOfIncident
    )

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [prisoner, prisonerNeurodiversities] = await Promise.all([
      new PrisonApiClient(token).getPrisonerDetails(adjudicationData.reportedAdjudication.prisonerNumber),
      this.curiousApiService.getNeurodiversitiesForReport(adjudicationData.reportedAdjudication.prisonerNumber, token),
    ])
    // TODO - later
    // const profileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)
    // const prisonerOtherLanguages = await new PrisonApiClient(token).getSecondaryLanguages(bookingId),

    // const prisonerPreferredNonEnglishLanguage = getNonEnglishReadLanguage(profileData.language)

    return {
      reportExpirationDateTime,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      prisonerPreferredNonEnglishLanguage: 'Spanish',
      prisonerOtherLanguages: ['German', 'French'],
      prisonerNeurodiversities,
    }
  }
}
