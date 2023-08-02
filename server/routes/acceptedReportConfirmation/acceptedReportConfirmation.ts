import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { getDate, getTime, possessive } from '../../utils/utils'

export default class AcceptedReportConfirmationRoute {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const adjudicationDetails = await this.reportedAdjudicationsService.getAcceptedReportConfirmationDetails(
      chargeNumber,
      user
    )

    return res.render(`pages/acceptedReportConfirmation.njk`, {
      expiryTime: getTime(adjudicationDetails.reportExpirationDateTime, 'H:mm'),
      expiryDate: getDate(adjudicationDetails.reportExpirationDateTime),
      bannerText: `${possessive(adjudicationDetails.prisonerFullName)} report has been accepted`,
      prisonerName: adjudicationDetails.prisonerFullName,
      showScheduleHearingButton: adjudicationDetails.transferableActionsAllowed,
      scheduleHearingLink: adjudicationUrls.scheduleHearing.urls.start(chargeNumber),
      viewReportLink: adjudicationUrls.prisonerReport.urls.review(chargeNumber),
      allCompletedReportsLink: adjudicationUrls.allCompletedReports.urls.start(),
    })
  }
}
