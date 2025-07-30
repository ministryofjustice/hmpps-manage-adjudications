import url from 'url'
import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './createOnBehalfOfValidation'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfPage {
  constructor(private readonly createOnBehalfOfSessionService: CreateOnBehalfOfSessionService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const createdOnBehalfOfOfficer = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, id)
    this.createOnBehalfOfSessionService.setCreatedOnBehalfOfEditSubmittedAdjudication(
      req,
      id,
      req.query.editSubmittedAdjudication as string,
    )
    this.createOnBehalfOfSessionService.setRedirectUrl(req, id, req.query.referrer as string)

    return res.render(`pages/createOnBehalfOf`, {
      id,
      createdOnBehalfOfOfficer,
      cancelHref: this.createOnBehalfOfSessionService.getRedirectUrl(req, id),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const { createdOnBehalfOfOfficer } = req.body
    const validationError = validateForm(createdOnBehalfOfOfficer)
    if (validationError) {
      return res.render(`pages/createOnBehalfOf`, {
        errors: validationError ? [validationError] : [],
        id,
        createdOnBehalfOfOfficer,
        cancelHref: this.createOnBehalfOfSessionService.getRedirectUrl(req, id),
      })
    }

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.createOnBehalfOf.urls.reason(id),
        query: { createdOnBehalfOfOfficer },
      }),
    )
  }
}
