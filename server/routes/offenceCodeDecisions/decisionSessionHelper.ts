import { Request } from 'express'
import { OffenceData } from './offenceData'

// Methods to deal with adding and removing to and from the session
export function setOffenceData(req: Request, answers: OffenceData, draftAdjudicationNumber: string) {
  if (!req.session.offenceData) {
    req.session.offenceData = {}
  }
  req.session.offenceData[draftAdjudicationNumber] = answers
}

export function getOffenceData(req: Request, draftAdjudicationNumber: string): OffenceData {
  return req.session.offenceData?.[draftAdjudicationNumber]
}

export function getAndDeleteOffenceData(req: Request, draftAdjudicationNumber: string): OffenceData {
  const offenceData = getOffenceData(req, draftAdjudicationNumber)
  setOffenceData(req, null, draftAdjudicationNumber)
  return offenceData
}
