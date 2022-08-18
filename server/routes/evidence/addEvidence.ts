import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import EvidenceSessionService from '../../services/evidenceSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  evidenceType?: string
  evidenceDescription?: string
  cancelButtonHref?: string
}

export default class AddDamagesRoutes {
  constructor(private readonly damagesSessionService: EvidenceSessionService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, evidenceType, evidenceDescription } = pageData

    return res.render(`pages/addEvidence`, {
      errors: error ? [error] : [],
      evidenceDescription,
      evidenceType,
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
    const { evidenceDescription, evidenceType } = req.body

    // const error = validateForm({ evidenceDescription, evidenceType })
    // if (error) return this.renderView(req, res, { error, damageType, damageDescription })

    const damageToAdd = {
      type: evidenceType,
      description: evidenceDescription,
      reporter: user.username,
    }

    this.damagesSessionService.addSessionEvidence(req, damageToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfEvidence.urls.modified(adjudicationNumber))
  }
}
