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
    const reportExpirationDateTime = calculateExpirationTime(
      adjudicationData.reportedAdjudication.incidentDetails.dateTimeOfIncident
    )

    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [prisoner, secondaryLanguages, prisonerNeurodiversities] = await Promise.all([
      new PrisonApiClient(token).getPrisonerDetails(adjudicationData.reportedAdjudication.prisonerNumber),
      new PrisonApiClient(token).getSecondaryLanguages(adjudicationData.reportedAdjudication.bookingId),
      this.curiousApiService.getNeurodiversitiesForReport(adjudicationData.reportedAdjudication.prisonerNumber, token),
    ])

    const prisonerPreferredNonEnglishLanguage = getNonEnglishLanguage(prisoner.language)
    const prisonerOtherLanguages = secondaryLanguages?.map(l => l.description)

    return {
      reportExpirationDateTime,
      prisonerFirstName: prisoner.firstName,
      prisonerLastName: prisoner.lastName,
      prisonerPreferredNonEnglishLanguage,
      prisonerOtherLanguages,
      prisonerNeurodiversities,
    }
  }
}
