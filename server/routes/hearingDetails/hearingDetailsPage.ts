/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import {
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class HearingDetailsPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const reportedAdjudicationResult = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )
    const { reportedAdjudication } = reportedAdjudicationResult
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )
    return res.render(`pages/hearingDetails`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
      schedulingAvailable: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {}
}
