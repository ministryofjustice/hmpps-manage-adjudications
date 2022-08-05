import { Request } from 'express'
import { RoleAssociatedPrisoner } from './associatedPrisonerUtils'

type StashedAssociatedPrisoner = {
  roleAssociatedPrisoner: RoleAssociatedPrisoner
}

export const popDataFromSession = (req: Request, prisonerNumber: string): StashedAssociatedPrisoner => {
  const currentAssociatedPrisonerNumber = req.session.currentAssociatedPrisonersNumber
  const currentAssociatedPrisonerName = req.session.currentAssociatedPrisonersName

  return {
    roleAssociatedPrisoner: {
      prisonerNumber,
      currentAssociatedPrisonerName,
      currentAssociatedPrisonerNumber,
    },
  }
}

export const deleteSessionData = (req: Request) => {
  delete req.session.redirectUrl
  delete req.session.currentAssociatedPrisonersName
  delete req.session.currentAssociatedPrisonersNumber
}

export const stashDataOnSession = (returnUrl: string, dataToStore: StashedAssociatedPrisoner, req: Request) => {
  req.session.redirectUrl = returnUrl
  req.session.currentAssociatedPrisonersNumber = dataToStore.roleAssociatedPrisoner.currentAssociatedPrisonerNumber
  req.session.currentAssociatedPrisonersName = dataToStore.roleAssociatedPrisoner.currentAssociatedPrisonerName
}
