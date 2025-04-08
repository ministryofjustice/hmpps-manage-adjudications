import { Request, Response } from 'express'
import moment from 'moment/moment'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole, momentDateToDatePicker } from '../../../utils/utils'
import { DISFormfilterFromUiFilter } from '../../../utils/adjudicationFilterHelper'
import log from '../../../log'

export default class FormsTabRoute {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    const { chargeNumber } = req.params
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
      user
    )
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )

    const formattedDisIssues = await this.reportedAdjudicationsService.handleDisIssueHistoryFormatting(
      reportedAdjudication,
      user
    )
    const filter = DISFormfilterFromUiFilter({
      fromDate: momentDateToDatePicker(moment().subtract(6, 'months')),
      toDate: momentDateToDatePicker(moment()),
      locationId: null,
    })
    const results = (await this.reportedAdjudicationsService.getAdjudicationDISFormData(user, filter, false)).filter(
      adj => adj.chargeNumber === chargeNumber
    )
    const { path } = req.query
    const tabUrls = this.getTabUrls(path as string, chargeNumber)

    return res.render(`pages/adjudicationForReport/formsTab`, {
      prisoner,
      chargeNumber: reportedAdjudication.chargeNumber,
      reviewStatus: reportedAdjudication.status,
      reports: results,
      formsHref: adjudicationUrls.forms.urls.view(chargeNumber),
      noticeOfBeingPlacedOnReportPrisonerHref: `${adjudicationUrls.printPdf.urls.dis12(chargeNumber)}?copy=prisoner`,
      noticeOfBeingPlacedOnReportStaffHref: `${adjudicationUrls.printPdf.urls.dis12(chargeNumber)}?copy=staff`,
      ...tabUrls,
      outcomesEntered: reportedAdjudication.punishments?.length > 0,
      formattedDisIssues,
    })
  }

  getTabUrls = (path: string, chargeNumber: string) => {
    if (!path || path === 'view') {
      return {
        reportHref: adjudicationUrls.prisonerReport.urls.viewOnly(chargeNumber),
        hearingsHref: adjudicationUrls.hearingDetails.urls.viewOnly(chargeNumber),
        punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.viewOnly(chargeNumber),
      }
    }
    if (path === 'review') {
      return {
        reportHref: adjudicationUrls.prisonerReport.urls.review(chargeNumber),
        hearingsHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
        punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      }
    }
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(chargeNumber),
    }
  }
}
