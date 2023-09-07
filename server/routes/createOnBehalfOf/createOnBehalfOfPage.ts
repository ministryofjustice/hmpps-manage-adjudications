/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import validateForm from './createOnBehalfOfValidation'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

export default class CreateOnBehalfOfPage {
  constructor(
    private readonly decisionTreeService: DecisionTreeService,
    private readonly checkOnBehalfOfSessionService: CheckOnBehalfOfSessionService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { user } = res.locals
    const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    const createdOnBehalfOfOfficer = this.checkOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, draftId)
    // if (!req.session.createdOnBehalfOfOfficer) {
    //   req.session.createdOnBehalfOfOfficer = {}
    // }
    // if (!req.session.createdOnBehalfOfOfficer[draftId]) {
    //   req.session.createdOnBehalfOfOfficer[draftId] = {}
    // } else {
    //   createdOnBehalfOfOfficer = req.session.createdOnBehalfOfOfficer[draftId]
    // }

    return res.render(`pages/createOnBehalfOf`, {
      draftId,
      createdOnBehalfOfOfficer,
      cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)

    const { createdOnBehalfOfOfficer } = req.body
    const validationError = validateForm(createdOnBehalfOfOfficer)
    if (validationError) {
      const { user } = res.locals
      const { prisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

      return res.render(`pages/createOnBehalfOf`, {
        errors: validationError ? [validationError] : [],
        draftId,
        sessionCreatedOnBehalfOfOfficer: createdOnBehalfOfOfficer,
        cancelHref: adjudicationUrls.incidentDetails.urls.edit(prisoner.prisonerNumber, draftId),
      })
    }

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.createOnBehalfOf.urls.reason(draftId),
        query: { createdOnBehalfOfOfficer },
      })
    )
  }
}
