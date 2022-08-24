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
  cancelButtonHref?: string
}

export default class AddEvidenceRoutes {
  constructor(private readonly evidenceSessionService: EvidenceSessionService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { cancelButtonHref, error, evidenceType, evidenceDescription, bwcIdentifier, batIdentifier } = pageData

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
    // This is the draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return this.renderView(req, res, {
      cancelButtonHref: adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { evidenceDescription, evidenceType, bwcIdentifier, batIdentifier } = req.body

    const error = validateForm({ evidenceDescription, evidenceType, bwcIdentifier, batIdentifier })
    if (error)
      return this.renderView(req, res, { error, evidenceDescription, evidenceType, bwcIdentifier, batIdentifier })

    const evidenceIdentifier = await this.getIdentifierToAdd(bwcIdentifier, batIdentifier)

    const evidenceToAdd = {
      code: evidenceType,
      details: evidenceDescription,
      reporter: user.username,
      ...(evidenceIdentifier && { identifier: evidenceIdentifier }),
    }

    this.evidenceSessionService.addSessionEvidence(req, evidenceToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber))
  }

  getIdentifierToAdd = async (bwcIdentifier: string, batIdentifier: string) => {
    return bwcIdentifier || batIdentifier || null
  }
}
