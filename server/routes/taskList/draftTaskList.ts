import { Request, Response } from 'express'

import { formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'
import { detailsOfOffence } from '../../utils/urlGenerator'

export default class DraftTaskListRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No adjudication number provided')
    }

    const prisoner = await this.placeOnReportService.getPrisonerDetailsFromAdjNumber(idValue, user)
    const taskListDetails = await this.placeOnReportService.getInfoForTaskListStatuses(idValue, user)

    return res.render(`pages/draftTaskList`, {
      prisoner,
      adjudicationId: id,
      statementPresent: taskListDetails.statementPresent,
      statementComplete: taskListDetails.statementComplete,
      offenceDetailsComplete: taskListDetails.offenceDetailsComplete,
      prisonerFirstAndLastName: prisoner.friendlyName,
      expirationTime: formatTimestampToTime(taskListDetails.handoverDeadline),
      expirationDay: formatTimestampToDate(taskListDetails.handoverDeadline, 'D MMMM YYYY'),
      detailsOfOffenceUrl: detailsOfOffence.urls.start(idValue),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
