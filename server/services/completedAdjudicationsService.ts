import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { PageResponse } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'
import PrisonApiClient from '../data/prisonApiClient'
import { convertToTitleCase, formatTimestampToDate, timestampToDate } from '../utils/utils'
import PrisonerSimpleResult from '../data/prisonerSimpleResult'

interface ReportedAdjudicationEnhanced extends ReportedAdjudication {
  displayName: string
  friendlyName: string
  formattedDateTimeOfIncident: string
  dateTimeOfIncident: Date
}

export default class CompletedAdjudicationsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getYourCompletedAdjudications(
    user: User,
    pageRequest: PageRequest
  ): Promise<PageResponse<ReportedAdjudicationEnhanced>> {
    const pageResponse = await new ManageAdjudicationsClient(user.token).getYourCompletedAdjudications(
      user.activeCaseLoadId,
      pageRequest
    )
    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(pageResponse.content.map(_ => _.prisonerNumber))
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    return pageResponse.map(reportedAdjudication =>
      this.enhanceReportedAdjudication(reportedAdjudication, prisonerDetails.get(reportedAdjudication.prisonerNumber))
    )
  }

  enhanceReportedAdjudication(
    reportedAdjudication: ReportedAdjudication,
    prisonerResult: PrisonerSimpleResult
  ): ReportedAdjudicationEnhanced {
    const displayName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.lastName}, ${prisonerResult.firstName}`)) || ''
    const friendlyName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || ''
    return {
      ...reportedAdjudication,
      displayName,
      friendlyName,
      dateTimeOfIncident: timestampToDate(reportedAdjudication.incidentDetails.dateTimeOfIncident),
      formattedDateTimeOfIncident: formatTimestampToDate(
        reportedAdjudication.incidentDetails.dateTimeOfIncident,
        'DD MMMM YYYY - HH:mm'
      ),
    }
  }
}
