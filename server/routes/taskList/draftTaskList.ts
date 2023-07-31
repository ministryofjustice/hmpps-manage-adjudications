import { Request, Response } from 'express'

import { formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class DraftTaskListRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const chargeNumber = Number(req.params.chargeNumber)
    const { user } = res.locals

    const [prisoner, taskListDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(chargeNumber, user),
      this.placeOnReportService.getInfoForTaskListStatuses(chargeNumber, user),
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
        linkUrl: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, chargeNumber),
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
        linkUrl: adjudicationUrls.detailsOfDamages.urls.start(chargeNumber),
        linkAttributes: 'damages-link',
        linkText: 'Damages',
        statusClass: damagesStatus.classes,
        statusText: damagesStatus.text,
      },
      // evidence
      {
        id: 'evidence-info',
        linkUrl: adjudicationUrls.detailsOfEvidence.urls.start(chargeNumber),
        linkAttributes: 'evidence-link',
        linkText: 'Evidence',
        statusClass: evidenceStatus.classes,
        statusText: evidenceStatus.text,
      },
      // witnesses
      {
        id: 'witnesses-info',
        linkUrl: adjudicationUrls.detailsOfWitnesses.urls.start(chargeNumber),
        linkAttributes: 'witnesses-link',
        linkText: 'Witnesses',
        statusClass: witnessesStatus.classes,
        statusText: witnessesStatus.text,
      },
      // incident statement
      {
        id: 'incident-statement-info',
        linkUrl: adjudicationUrls.incidentStatement.urls.start(chargeNumber),
        linkAttributes: 'incident-statement-link',
        linkText: 'Incident statement',
        statusClass: incidentStatementStatus.classes,
        statusText: incidentStatementStatus.text,
      },
      // accept details (check your answers)
      {
        id: 'accept-details-info',
        linkUrl: adjudicationUrls.checkYourAnswers.urls.start(chargeNumber),
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
