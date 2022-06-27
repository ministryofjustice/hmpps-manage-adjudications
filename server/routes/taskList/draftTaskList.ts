import { Request, Response } from 'express'

import { formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class DraftTaskListRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No adjudication number provided')
    }

    const [prisoner, taskListDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(idValue, user),
      this.placeOnReportService.getInfoForTaskListStatuses(idValue, user),
    ])
    const {
      offenceDetailsComplete,
      taskListDisplay,
      showLinkForAcceptDetails,
      handoverDeadline,
      statementComplete,
      statementPresent,
    } = taskListDetails

    return res.render(`pages/draftTaskList`, {
      prisoner,
      adjudicationId: id,
      statementPresent,
      statementComplete,
      offenceDetailsComplete,
      taskListDisplay,
      prisonerFirstAndLastName: prisoner.friendlyName,
      expirationTime: formatTimestampToTime(handoverDeadline),
      expirationDay: formatTimestampToDate(handoverDeadline, 'D MMMM YYYY'),
      showLinkForAcceptDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
