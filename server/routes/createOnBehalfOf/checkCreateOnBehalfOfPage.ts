/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'

const stubReportingOfficer = 'some officer'
const stubReason = 'Long piece of text explaining why they are creating this report on behalf of someone else'

export default class CheckYourAnswersPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly placeOnReportService: PlaceOnReportService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    const checkData = [
      {
        label: 'New reporting officer',
        value: stubReportingOfficer,
        changeLinkHref: 'NN-5540',
      },
      {
        label: 'Reason why you are reporting on their behalf',
        value: stubReason,
        changeLinkHref: 'NN-5541',
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
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    await this.placeOnReportService.setCreatedOnBehalfOf(draftId, stubReportingOfficer, stubReason, user)
    return res.redirect(adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId))
  }
}
