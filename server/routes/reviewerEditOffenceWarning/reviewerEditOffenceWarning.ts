import type { Request, Response } from 'express'
import type DecisionTreeService from '../../services/decisionTreeService'
import type UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import type ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class ReviewerEditOffenceWarningRoute {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService,
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals

    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const [newDraftAdjudicationId, incidentData] = await Promise.all([
      this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(user, chargeNumber),
      this.decisionTreeService.reportedAdjudicationIncidentData(chargeNumber, user),
    ])

    const { prisoner, associatedPrisoner, reportedAdjudication } = incidentData

    const offence = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      false,
    )

    return res.render(`pages/reviewerEditOffenceWarning`, {
      offence,
      isYouthOffender: reportedAdjudication.isYouthOffender,
      nextPageHref: adjudicationUrls.ageOfPrisoner.urls.aloSubmittedEditWithResettingOffences(newDraftAdjudicationId),
      cancelHref: adjudicationUrls.prisonerReport.urls.review(chargeNumber),
    })
  }
}
