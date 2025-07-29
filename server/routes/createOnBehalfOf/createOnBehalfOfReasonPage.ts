import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './createOnBehalfOfReasonValidation'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfReasonPage {
  constructor(private readonly createOnBehalfOfSessionService: CreateOnBehalfOfSessionService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { createdOnBehalfOfOfficer } = req.query
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, id)

    return res.render(`pages/createOnBehalfOfReason`, {
      id,
      createdOnBehalfOfOfficer,
      createdOnBehalfOfReason,
      cancelHref: this.createOnBehalfOfSessionService.getRedirectUrl(req, id),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const { createdOnBehalfOfOfficer } = req.query
    this.createOnBehalfOfSessionService.setCreatedOnBehalfOfOfficer(req, id, createdOnBehalfOfOfficer as string)

    const { createdOnBehalfOfReason } = req.body
    const validationError = validateForm(createdOnBehalfOfReason)
    if (validationError) {
      return res.render(`pages/createOnBehalfOfReason`, {
        errors: validationError ? [validationError] : [],
        id,
        createdOnBehalfOfOfficer,
        sessionCreatedOnBehalfOfReason: createdOnBehalfOfReason,
        cancelHref: this.createOnBehalfOfSessionService.getRedirectUrl(req, id),
      })
    }
    this.createOnBehalfOfSessionService.setCreatedOnBehalfOfReason(req, id, createdOnBehalfOfReason)

    return res.redirect(adjudicationUrls.createOnBehalfOf.urls.check(id))
  }
}
