import { Request } from 'express'

export default class CheckOnBehalfOfSessionService {
  setCreatedOnBehalfOfOfficer(req: Request, draftId: number, createdOnBehalfOfOfficer: string): void {
    this.setCreatedOnBehalfOf(req, draftId)
    req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer = createdOnBehalfOfOfficer
  }

  getCreatedOnBehalfOfOfficer(req: Request, draftId: number): string {
    return req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer
  }

  deleteCreatedOnBehalfOfOfficer(req: Request, draftId: number): void {
    delete req.session.createdOnBehalfOf[draftId].createdOnBehalfOfOfficer
  }

  setCreatedOnBehalfOfReason(req: Request, draftId: number, createdOnBehalfOfReason: string): void {
    this.setCreatedOnBehalfOf(req, draftId)
    req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason = createdOnBehalfOfReason
  }

  getCreatedOnBehalfOfReason(req: Request, draftId: number): string {
    return req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason
  }

  deleteCreatedOnBehalfOfReason(req: Request, draftId: number): void {
    delete req.session.createdOnBehalfOf[draftId].createdOnBehalfOfReason
  }

  setCreatedOnBehalfOf(req: Request, draftId: number) {
    if (!req.session.createdOnBehalfOf) {
      req.session.createdOnBehalfOf = {}
    }
    if (!req.session.createdOnBehalfOf[draftId]) {
      req.session.createdOnBehalfOf[draftId] = {}
    }
  }
}
