import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class ReviewerEditOffenceWarningRoute {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals

    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const [newDraftAdjudicationId, reportedAdjudicationResult, incidentData] = await Promise.all([
      this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(user, adjudicationNumber),
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(adjudicationNumber, user),
      this.decisionTreeService.reportedAdjudicationIncidentData(adjudicationNumber, user),
    ])

    const { reportedAdjudication } = reportedAdjudicationResult
    const { prisoner, associatedPrisoner } = incidentData

    const offence = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      false
    )

    return res.render(`pages/reviewerEditOffenceWarning`, {
      offence,
      isYouthOffender: reportedAdjudication.isYouthOffender,
      nextPageHref: adjudicationUrls.ageOfPrisoner.urls.aloSubmittedEditWithResettingOffences(newDraftAdjudicationId),
      cancelHref: adjudicationUrls.prisonerReport.urls.review(adjudicationNumber),
    })
  }
}
