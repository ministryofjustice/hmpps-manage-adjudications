import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import NoticeOfBeingPlacedOnReportData from './noticeOfBeingPlacedOnReportData'
import config from '../../config'
import DecisionTreeService from '../../services/decisionTreeService'

export default class PrintReportRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { referrer } = req.query
    const { user } = res.locals

    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(adjudicationNumber, user)
    return res.render(`pages/printReport`, {
      adjudicationNumber,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'dddd D MMMM'),
      prisonerFirstAndLastName: formatName(adjudicationDetails.prisonerFirstName, adjudicationDetails.prisonerLastName),
      showPrisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage != null,
      prisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage,
      showPrisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages?.length > 0,
      prisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages,
      showPrisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities?.length > 0,
      prisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities,
      exitUrl: referrer,
      noticeOfBeingPlacedOnReportData: new NoticeOfBeingPlacedOnReportData(adjudicationNumber, adjudicationDetails),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(adjudicationNumber, user)
    const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(adjudicationNumber, adjudicationDetails)
    const allOffenceData = await this.decisionTreeService.allOffences(adjudicationNumber, user)
    const { reportedAdjudication, associatedPrisoner, prisoner } =
      await this.decisionTreeService.reportedAdjudicationIncidentData(adjudicationNumber, user)
    const offences = this.decisionTreeService.getAdjudicationOffences(
      allOffenceData,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user
    )
    res.renderPdf(
      `pages/noticeOfBeingPlacedOnReport2`,
      { adjudicationsUrl, noticeOfBeingPlacedOnReportData },
      `pages/noticeOfBeingPlacedOnReportHeader`,
      {},
      `pages/noticeOfBeingPlacedOnReportFooter`,
      { adjudicationNumber },
      {
        filename: `adjudication-report-${adjudicationNumber}`,
        pdfMargins,
      }
    )
  }
}
