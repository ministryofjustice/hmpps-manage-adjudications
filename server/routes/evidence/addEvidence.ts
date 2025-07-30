import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import { EvidenceCode } from '../../data/DraftAdjudicationResult'
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
    const { chargeNumber } = req.params
    const submitted = req.query.submitted as string

    const cancelButtonHref =
      submitted === 'true'
        ? adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(chargeNumber)
        : adjudicationUrls.detailsOfEvidence.urls.modified(chargeNumber)

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
    const { chargeNumber } = req.params
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

    const evidenceIdentifier = await this.getIdentifierToAdd(evidenceType, bwcIdentifier, batIdentifier)

    const evidenceToAdd = {
      code: evidenceType,
      details: evidenceDescription,
      reporter: user.username,
      ...(evidenceIdentifier && { identifier: evidenceIdentifier }),
    }

    this.evidenceSessionService.addSessionEvidence(req, evidenceToAdd, chargeNumber)
    const redirectUrl = this.getRedirectUrl(submitted === 'true', chargeNumber)
    return res.redirect(redirectUrl)
  }

  getIdentifierToAdd = async (evidenceType: EvidenceCode, bwcIdentifier: string, batIdentifier: string) => {
    if (evidenceType === EvidenceCode.BAGGED_AND_TAGGED) {
      return batIdentifier
    }
    if (evidenceType === EvidenceCode.BODY_WORN_CAMERA) {
      return bwcIdentifier
    }
    return null
  }

  getRedirectUrl = (submitted: boolean, chargeNumber: string) => {
    if (submitted) return adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(chargeNumber)
    return adjudicationUrls.detailsOfEvidence.urls.modified(chargeNumber)
  }
}
