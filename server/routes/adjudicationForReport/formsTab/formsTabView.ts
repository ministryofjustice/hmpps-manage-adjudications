import { Request, Response } from 'express'
import moment from 'moment/moment'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole, momentDateToDatePicker } from '../../../utils/utils'
import { DISFormfilterFromUiFilter } from '../../../utils/adjudicationFilterHelper'

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

    const filter = DISFormfilterFromUiFilter({
      fromDate: momentDateToDatePicker(moment().subtract(2, 'years')),
      toDate: momentDateToDatePicker(moment()),
      locationId: null,
    })
    const results = (await this.reportedAdjudicationsService.getAdjudicationDISFormData(user, filter, false)).filter(
      adj => adj.chargeNumber === chargeNumber
    )

    return res.render(`pages/adjudicationForReport/formsTab`, {
      prisoner,
      reportNo: reportedAdjudication.chargeNumber,
      reviewStatus: reportedAdjudication.status,
      reports: results,
      reportHref: adjudicationUrls.prisonerReport.urls.review(chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      formsHref: adjudicationUrls.forms.urls.review(chargeNumber),
    })
  }
}
