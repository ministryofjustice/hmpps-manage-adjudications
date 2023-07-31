/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { formatName, possessive } from '../../utils/utils'

export enum PageRequestType {
  ORIGINAL_REPORT_CONFIRMATION,
  REPORT_CHANGE,
  POST_REVIEW_REPORT_CHANGE,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isOriginalReportConfirmation(): boolean {
    return this.pageType === PageRequestType.ORIGINAL_REPORT_CONFIRMATION
  }

  isReportChangeBeforeReview(): boolean {
    return this.pageType === PageRequestType.REPORT_CHANGE
  }

  isReportChangeAfterReview(): boolean {
    return this.pageType === PageRequestType.POST_REVIEW_REPORT_CHANGE
  }
}

export default class confirmedOnReportPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params

    const submittedEditConfirmationDetails = this.getSubmittedEditReturnLinkDetails(req)

    const adjudicationDetails = await this.reportedAdjudicationsService.getSimpleConfirmationDetails(chargeNumber, user)

    const prisonerFirstAndLastName = formatName(
      adjudicationDetails.prisonerFirstName,
      adjudicationDetails.prisonerLastName
    )

    const showNextStepsContent = !this.pageOptions.isReportChangeAfterReview()

    return res.render(`pages/confirmedOnReport`, {
      showNextStepsContent,
      bannerText: this.getBannerText(prisonerFirstAndLastName),
      yourCompletedReportsLink: adjudicationUrls.yourCompletedReports.urls.start(),
      submittedEditConfirmationReturnUrl: submittedEditConfirmationDetails.url,
      submittedEditConfirmationReturnText: submittedEditConfirmationDetails.text,
      pageTitle: this.getPageTitle(),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  getBannerText = (prisonerFirstAndLastName: string) => {
    if (this.pageOptions.isOriginalReportConfirmation()) {
      return `Your report for ${prisonerFirstAndLastName} has been submitted for review`
    }
    if (this.pageOptions.isReportChangeBeforeReview()) {
      return `${possessive(prisonerFirstAndLastName)} report has been changed. It will now be reviewed.`
    }
    return `${possessive(prisonerFirstAndLastName)} report has been changed`
  }

  getPageTitle = () => {
    if (this.pageOptions.isOriginalReportConfirmation()) {
      return 'Report submitted for review'
    }
    return 'Report change is confirmed'
  }

  getSubmittedEditReturnLinkDetails = (req: Request) => {
    // Referrer is only provided when coming from the damages, evidence and witnesses pages when they are edited on the reported adjudication. Fallback required - without the referrer we wouldn't know whether to send them to the reviewer or reporter version (without making an extra api call to get user roles)
    if (req.query.referrer) {
      return {
        url: req.query.referrer as string,
        text: 'Back to report',
      }
    }
    return {
      url: adjudicationUrls.homepage.root,
      text: 'Back to homepage',
    }
  }
}
