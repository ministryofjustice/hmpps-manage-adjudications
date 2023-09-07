/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

export default class CheckCreateOnBehalfOfPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly checkOnBehalfOfSessionService: CheckOnBehalfOfSessionService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    const createdOnBehalfOfOfficer = this.checkOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, draftId)
    const createdOnBehalfOfReason = this.checkOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, draftId)
    const checkData = [
      {
        label: 'New reporting officer',
        value: createdOnBehalfOfOfficer,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.start(draftId)}`,
      },
      {
        label: 'Reason why you are reporting on their behalf',
        value: createdOnBehalfOfReason,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.reason(
          draftId
        )}?createdOnBehalfOfOfficer=${createdOnBehalfOfOfficer}`,
      },
    ]

    return res.render(`pages/checkCreateOnBehalfOf`, {
      draftId,
      checkData,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const createdOnBehalfOfOfficer = this.checkOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, draftId)
    const createdOnBehalfOfReason = this.checkOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, draftId)

    const { user } = res.locals
    await this.placeOnReportService.setCreatedOnBehalfOf(
      draftId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      user
    )
    this.checkOnBehalfOfSessionService.deleteCreatedOnBehalfOfOfficer(req, draftId)
    this.checkOnBehalfOfSessionService.deleteCreatedOnBehalfOfReason(req, draftId)

    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    return res.redirect(adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId))
  }
}
