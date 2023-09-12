/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CheckCreateOnBehalfOfPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly createOnBehalfOfSessionService: CreateOnBehalfOfSessionService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    const createdOnBehalfOfOfficer = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, draftId)
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, draftId)
    const checkData = [
      {
        label: 'New reporting officer',
        value: createdOnBehalfOfOfficer,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.start(draftId)}`,
        dataQa: 'reporting-officer-changeLink',
      },
      {
        label: 'Reason why you are reporting on their behalf',
        value: createdOnBehalfOfReason,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.reason(
          draftId
        )}?createdOnBehalfOfOfficer=${createdOnBehalfOfOfficer}`,
        dataQa: 'reason-changeLink',
      },
    ]

    return res.render(`pages/checkCreateOnBehalfOf`, {
      draftId,
      checkData,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = Number(req.params.draftId)
    const createdOnBehalfOfOfficer = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, draftId)
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, draftId)

    await this.placeOnReportService.setCreatedOnBehalfOf(
      draftId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      user
    )
    this.createOnBehalfOfSessionService.deleteCreatedOnBehalfOfOfficer(req, draftId)
    this.createOnBehalfOfSessionService.deleteCreatedOnBehalfOfReason(req, draftId)

    return res.redirect(this.createOnBehalfOfSessionService.getRedirectUrl(req, draftId))
  }
}
