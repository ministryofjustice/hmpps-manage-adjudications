import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import NoticeOfBeingPlacedOnReportData from './noticeOfBeingPlacedOnReportData'

export default class PrintReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { referrer } = req.query
    const { user } = res.locals

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(adjudicationNumberValue)) {
      throw new Error('No adjudication number provided')
    }

    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(
      adjudicationNumberValue,
      user
    )

    return res.render(`pages/printReport`, {
      adjudicationNumber: adjudicationNumberValue,
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

  getPdfFooter = (): string => {
    return `
      <span style="${pdfHeaderFooterStyle}">
        <table style="width: 100%; padding-left: 15px; padding-right: 15px;">
          <tr>
            <td style="text-align: center;">NOMS No: <span style="font-weight: bold;">qqRP</span></td>
            <td style="text-align: center;">Booking No: <span style="font-weight: bold;">qqRp</span></td>
            <td style="text-align: center;">CRO No: <span style="font-weight: bold;">qqRP</span></td>
            <td style="text-align: center;">PNC ID: <span style="font-weight: bold;">qqRP</span></td>
            <td style="text-align: center;">Prison: <span style="font-weight: bold;">qqRP</span></td>
          </tr>
        </table>
        <p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </p>
     </span>`
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    res.renderPDF(
      `pages/qqrptest`,
      {},
      {
        filename: 'qqrpfilename',
        pdfOptions: {
          headerHtml: null,
          footerHtml: this.getPdfFooter(),
          marginTop: '0.8',
          marginBottom: '1.0',
          marginLeft: '0.55',
          marginRight: '0.35',
        },
      }
    )
  }
}

const pdfHeaderFooterStyle =
  'font-family: Arial; ' +
  'font-size: 10px; ' +
  'font-weight: normal; ' +
  'width: 100%; ' +
  'height: 35px; ' +
  'text-align: center; ' +
  'padding: 20px;'
