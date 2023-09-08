/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import validateForm from './createOnBehalfOfReasonValidation'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfReasonPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly createOnBehalfOfSessionService: CreateOnBehalfOfSessionService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    const { createdOnBehalfOfOfficer } = req.query
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, draftId)

    return res.render(`pages/createOnBehalfOfReason`, {
      draftId,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)

    const { createdOnBehalfOfOfficer } = req.query
    this.createOnBehalfOfSessionService.setCreatedOnBehalfOfOfficer(req, draftId, createdOnBehalfOfOfficer as string)

    const { createdOnBehalfOfReason } = req.body
    const validationError = validateForm(createdOnBehalfOfReason)
    if (validationError) {
      const { user } = res.locals
      const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

      return res.render(`pages/createOnBehalfOfReason`, {
        errors: validationError ? [validationError] : [],
        draftId,
        createdOnBehalfOfOfficer,
        sessionCreatedOnBehalfOfReason: createdOnBehalfOfReason,
        cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
      })
    }
    this.createOnBehalfOfSessionService.setCreatedOnBehalfOfReason(req, draftId, createdOnBehalfOfReason)

    return res.redirect(adjudicationUrls.createOnBehalfOf.urls.check(draftId))
  }
}
