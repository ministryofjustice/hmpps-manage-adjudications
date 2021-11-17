import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { PageResponse } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'
import PrisonApiClient from '../data/prisonApiClient'
import { convertToTitleCase, formatTimestampToDate } from '../utils/utils'
import PrisonerResult from '../data/prisonerResult'

interface ReportedAdjudicationEnhanced extends ReportedAdjudication {
  displayName: string
  friendlyName: string
  dateTimeOfIncident: string
}

export default class CompletedAdjudicationsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getCompletedAdjudications(
    user: User,
    pageRequest: PageRequest
  ): Promise<PageResponse<ReportedAdjudicationEnhanced>> {
    const pageResponse = await new ManageAdjudicationsClient(user.token).getCompletedAdjudications(
      user.activeCaseLoadId,
      pageRequest
    )
    const prisonerDetails = await new PrisonApiClient(user.token).getBatchPrisonerDetails(
      pageResponse.content.map(_ => _.prisonerNumber)
    )

    return pageResponse.map(reportedAdjudication =>
      this.enhanceReportedAdjudication(reportedAdjudication, prisonerDetails)
    )
  }

  enhanceReportedAdjudication(
    reportedAdjudication: ReportedAdjudication,
    prisonerResults: PrisonerResult[]
  ): ReportedAdjudicationEnhanced {
    const prisonerResult = prisonerResults.find(
      prisonerDetail => prisonerDetail.offenderNo === reportedAdjudication.prisonerNumber
    )
    const displayName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.lastName}, ${prisonerResult.firstName}`)) || ''
    const friendlyName =
      (prisonerResult && convertToTitleCase(`${prisonerResult.firstName} ${prisonerResult.lastName}`)) || ''
    return {
      ...reportedAdjudication,
      displayName,
      friendlyName,
      dateTimeOfIncident: formatTimestampToDate(
        reportedAdjudication.incidentDetails.dateTimeOfIncident,
        'DD MMMM YYYY - HH:mm'
      ),
    }
  }
}
