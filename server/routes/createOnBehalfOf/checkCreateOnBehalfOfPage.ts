/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class CheckCreateOnBehalfOfPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly placeOnReportService: PlaceOnReportService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    const createdOnBehalfOfOfficer = req.session.createdOnBehalfOfOfficer[draftId]
    const createdOnBehalfOfReason = req.session.createdOnBehalfOfReason[draftId]
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

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const createdOnBehalfOfOfficer = req.session.createdOnBehalfOfOfficer[draftId]
    const createdOnBehalfOfReason = req.session.createdOnBehalfOfReason[draftId]

    const { user } = res.locals
    await this.placeOnReportService.setCreatedOnBehalfOf(
      draftId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      user
    )
    delete req.session.createdOnBehalfOfOfficer[draftId]
    delete req.session.createdOnBehalfOfReason[draftId]

    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    return res.redirect(adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId))
  }
}
