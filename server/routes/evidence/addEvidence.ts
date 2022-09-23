import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './addEvidenceValidation'

type PageData = {
  error?: FormError
  evidenceType?: string
  evidenceDescription?: string
  bwcIdentifier?: string
  batIdentifier?: string
}

export default class AddEvidenceRoutes {
  constructor(private readonly evidenceSessionService: EvidenceSessionService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, evidenceType, evidenceDescription, bwcIdentifier, batIdentifier } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const submitted = req.query.submitted as string

    // eslint-disable-next-line no-extra-boolean-cast
    const cancelButtonHref =
      submitted === 'true'
        ? adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(adjudicationNumber)
        : adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber)

    return res.render(`pages/addEvidence`, {
      errors: error ? [error] : [],
      evidenceDescription,
      evidenceType,
      bwcIdentifier,
      batIdentifier,
      cancelButtonHref,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const submitted = req.query.submitted as string
    const { evidenceDescription, evidenceType, bwcIdentifier, batIdentifier } = req.body

    const error = validateForm({ evidenceDescription, evidenceType, bwcIdentifier, batIdentifier })
    if (error)
      return this.renderView(req, res, {
        error,
        evidenceDescription,
        evidenceType,
        bwcIdentifier,
        batIdentifier,
      })

    const evidenceIdentifier = await this.getIdentifierToAdd(bwcIdentifier, batIdentifier)

    const evidenceToAdd = {
      code: evidenceType,
      details: evidenceDescription,
      reporter: user.username,
      ...(evidenceIdentifier && { identifier: evidenceIdentifier }),
    }

    this.evidenceSessionService.addSessionEvidence(req, evidenceToAdd, adjudicationNumber)
    const redirectUrl = this.getRedirectUrl(submitted === 'true', adjudicationNumber)
    return res.redirect(redirectUrl)
  }

  getIdentifierToAdd = async (bwcIdentifier: string, batIdentifier: string) => {
    return bwcIdentifier || batIdentifier || null
  }

  getRedirectUrl = (submitted: boolean, adjudicationNumber: number) => {
    if (submitted) return adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(adjudicationNumber)
    return adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber)
  }
}
