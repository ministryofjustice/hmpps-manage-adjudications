import { Request, Response } from 'express'

import { formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

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
      offenceDetailsStatus,
      showLinkForAcceptDetails,
      handoverDeadline,
      offenceDetailsUrl,
      incidentStatementStatus,
      damagesStatus,
      evidenceStatus,
      witnessesStatus,
    } = taskListDetails

    const taskListDisplay = [
      // incident details
      {
        id: 'incident-details-info',
        linkUrl: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, idValue),
        linkAttributes: 'incident-details-link',
        linkText: 'Incident details',
        statusClass: 'govuk-tag',
        statusText: 'COMPLETED',
      },
      // offence details
      {
        id: 'offence-details-info',
        linkUrl: offenceDetailsUrl,
        linkAttributes: 'details-of-offence-link',
        linkText: 'Offence details',
        statusClass: offenceDetailsStatus.classes,
        statusText: offenceDetailsStatus.text,
      },
      // damages
      {
        id: 'damages-info',
        linkUrl: adjudicationUrls.detailsOfDamages.urls.start(idValue),
        linkAttributes: 'damages-link',
        linkText: 'Damages',
        statusClass: damagesStatus.classes,
        statusText: damagesStatus.text,
      },
      // evidence
      {
        id: 'evidence-info',
        linkUrl: adjudicationUrls.detailsOfEvidence.urls.start(idValue),
        linkAttributes: 'evidence-link',
        linkText: 'Evidence',
        statusClass: evidenceStatus.classes,
        statusText: evidenceStatus.text,
      },
      // witnesses
      {
        id: 'witnesses-info',
        linkUrl: adjudicationUrls.detailsOfWitnesses.urls.start(idValue),
        linkAttributes: 'witnesses-link',
        linkText: 'Witnesses',
        statusClass: witnessesStatus.classes,
        statusText: witnessesStatus.text,
      },
      // incident statement
      {
        id: 'incident-statement-info',
        linkUrl: adjudicationUrls.incidentStatement.urls.start(idValue),
        linkAttributes: 'incident-statement-link',
        linkText: 'Incident statement',
        statusClass: incidentStatementStatus.classes,
        statusText: incidentStatementStatus.text,
      },
      // accept details (check your answers)
      {
        id: 'accept-details-info',
        linkUrl: adjudicationUrls.checkYourAnswers.urls.start(idValue),
        linkAttributes: 'accept-details-link',
        linkText: 'Accept details and place on report',
        statusClass: 'govuk-tag govuk-tag--grey',
        statusText: 'NOT STARTED',
      },
    ]

    return res.render(`pages/draftTaskList`, {
      prisoner,
      taskListDisplay,
      prisonerFirstAndLastName: prisoner.friendlyName,
      expirationTime: formatTimestampToTime(handoverDeadline),
      expirationDay: formatTimestampToDate(handoverDeadline, 'D MMMM YYYY'),
      showLinkForAcceptDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
