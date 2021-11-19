import { Request, Response } from 'express'

import { formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class DraftTaskListRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, id } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No adjudication number provided')
    }

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    const adjudicationDetails = {
      reportExpirationDateTime: '2021-11-19T15:53:00.000Z',
    }
    const data = await this.placeOnReportService.getDraftTaskListStatuses()

    return res.render(`pages/draftTaskList`, {
      prisoner,
      data,
      prisonerFirstAndLastName: prisoner.friendlyName,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'D MMMM YYYY'),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
