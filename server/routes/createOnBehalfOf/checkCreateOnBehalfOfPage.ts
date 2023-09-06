/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'

type PageData = {
  error?: FormError | FormError[]
}

export default class CheckYourAnswersPage {
  constructor(private readonly decisionTreeService: DecisionTreeService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    return res.render(`pages/checkCreateOnBehalfOf`, {
      errors: error ? [error] : [],
      draftId,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
      createdOnBehalfOfOfficer: 'some officer',
      createdOnBehalfOfReason: 'some reason',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)

    try {
      const { user } = res.locals
      const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
      return res.redirect(adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId))
    } catch (postError) {
      const errorRedirectUrl = adjudicationUrls.yourCompletedReports.root
      res.locals.redirectUrl = errorRedirectUrl
      throw postError
    }
  }
}
