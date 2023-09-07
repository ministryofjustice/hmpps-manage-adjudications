/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'

export default class CreateOnBehalfOfReasonPage {
  constructor(private readonly decisionTreeService: DecisionTreeService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    const { createdOnBehalfOfOfficer } = req.query

    let createdOnBehalfOfReason = ''
    if (!req.session.createdOnBehalfOfReason) {
      req.session.createdOnBehalfOfReason = {}
    }
    if (!req.session.createdOnBehalfOfReason[draftId]) {
      req.session.createdOnBehalfOfReason[draftId] = {}
    } else {
      createdOnBehalfOfReason = req.session.createdOnBehalfOfReason[draftId]
    }

    return res.render(`pages/createOnBehalfOfReason`, {
      draftId,
      createdOnBehalfOfOfficer,
      sessionCreatedOnBehalfOfReason: createdOnBehalfOfReason,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { createdOnBehalfOfOfficer } = req.query
    const { createdOnBehalfOfReason } = req.body
    req.session.createdOnBehalfOfOfficer[draftId] = createdOnBehalfOfOfficer as string
    req.session.createdOnBehalfOfReason[draftId] = createdOnBehalfOfReason
    return res.redirect(adjudicationUrls.createOnBehalfOf.urls.check(draftId))
  }
}
