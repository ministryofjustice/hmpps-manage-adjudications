import { Request } from 'express'

export default class CreateOnBehalfOfSessionService {
  setCreatedOnBehalfOfOfficer(req: Request, id: string, createdOnBehalfOfOfficer: string): void {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    req.session.createdOnBehalfOf[id].createdOnBehalfOfOfficer = createdOnBehalfOfOfficer
  }

  getCreatedOnBehalfOfOfficer(req: Request, id: string): string {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    return req.session.createdOnBehalfOf[id].createdOnBehalfOfOfficer
  }

  deleteCreatedOnBehalfOfOfficer(req: Request, id: string): void {
    delete req.session.createdOnBehalfOf[id].createdOnBehalfOfOfficer
  }

  setCreatedOnBehalfOfReason(req: Request, id: string, createdOnBehalfOfReason: string): void {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    req.session.createdOnBehalfOf[id].createdOnBehalfOfReason = createdOnBehalfOfReason
  }

  getCreatedOnBehalfOfReason(req: Request, id: string): string {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    return req.session.createdOnBehalfOf[id].createdOnBehalfOfReason
  }

  deleteCreatedOnBehalfOfReason(req: Request, id: string): void {
    delete req.session.createdOnBehalfOf[id].createdOnBehalfOfReason
  }

  setCreatedOnBehalfOfEditSubmittedAdjudication(
    req: Request,
    id: string,
    createdOnBehalfOfEditSubmittedAdjudication: string
  ): void {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    req.session.createdOnBehalfOf[id].createdOnBehalfOfEditSubmittedAdjudication =
      createdOnBehalfOfEditSubmittedAdjudication
  }

  getCreatedOnBehalfOfEditSubmittedAdjudication(req: Request, id: string): string {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    return req.session.createdOnBehalfOf[id].createdOnBehalfOfEditSubmittedAdjudication
  }

  deleteCreatedOnBehalfOfEditSubmittedAdjudication(req: Request, id: string): void {
    delete req.session.createdOnBehalfOf[id].createdOnBehalfOfEditSubmittedAdjudication
  }

  setRedirectUrl(req: Request, id: string, redirectUrl: string): void {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    req.session.createdOnBehalfOf[id].redirectUrl = redirectUrl
  }

  getRedirectUrl(req: Request, id: string): string {
    this.setCreatedOnBehalfOfForDraftId(req, id)
    return req.session.createdOnBehalfOf[id].redirectUrl
  }

  deleteRedirectUrl(req: Request, id: string): void {
    delete req.session.createdOnBehalfOf[id].redirectUrl
  }

  private setCreatedOnBehalfOfForDraftId(req: Request, id: string): void {
    if (!req.session.createdOnBehalfOf) {
      req.session.createdOnBehalfOf = {}
    }
    if (!req.session.createdOnBehalfOf[id]) {
      req.session.createdOnBehalfOf[id] = {}
    }
  }
}
