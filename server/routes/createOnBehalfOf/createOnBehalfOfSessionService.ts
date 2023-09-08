import { Request } from 'express'

export default class CreateOnBehalfOfSessionService {
  setCreatedOnBehalfOfOfficer(req: Request, draftId: number, createdOnBehalfOfOfficer: string): void {
    this.setCreatedOnBehalfOfForDraftId(req, draftId)
    req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer = createdOnBehalfOfOfficer
  }

  getCreatedOnBehalfOfOfficer(req: Request, draftId: number): string {
    this.setCreatedOnBehalfOfForDraftId(req, draftId)
    return req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer
  }

  deleteCreatedOnBehalfOfOfficer(req: Request, draftId: number): void {
    delete req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer
  }

  setCreatedOnBehalfOfReason(req: Request, draftId: number, createdOnBehalfOfReason: string): void {
    this.setCreatedOnBehalfOfForDraftId(req, draftId)
    req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason = createdOnBehalfOfReason
  }

  getCreatedOnBehalfOfReason(req: Request, draftId: number): string {
    this.setCreatedOnBehalfOfForDraftId(req, draftId)
    return req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason
  }

  deleteCreatedOnBehalfOfReason(req: Request, draftId: number): void {
    delete req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason
  }

  private setCreatedOnBehalfOfForDraftId(req: Request, draftId: number): void {
    if (!req.session.createdOnBehalfOf) {
      req.session.createdOnBehalfOf = {}
    }
    if (!req.session.createdOnBehalfOf[draftId]) {
      req.session.createdOnBehalfOf[draftId] = {}
    }
  }
}
