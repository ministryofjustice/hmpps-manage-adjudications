/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'

export default class CreateOnBehalfOfPage {
  constructor(private readonly decisionTreeService: DecisionTreeService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    let createdOnBehalfOfOfficer = ''
    if (!req.session.createdOnBehalfOfOfficer) {
      req.session.createdOnBehalfOfOfficer = {}
    }
    if (!req.session.createdOnBehalfOfOfficer[draftId]) {
      req.session.createdOnBehalfOfOfficer[draftId] = {}
    } else {
      createdOnBehalfOfOfficer = req.session.createdOnBehalfOfOfficer[draftId]
    }

    return res.render(`pages/createOnBehalfOf`, {
      draftId,
      sessionCreatedOnBehalfOfOfficer: createdOnBehalfOfOfficer,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { createdOnBehalfOfOfficer } = req.body
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.createOnBehalfOf.urls.reason(draftId),
        query: { createdOnBehalfOfOfficer },
      })
    )
  }
}
