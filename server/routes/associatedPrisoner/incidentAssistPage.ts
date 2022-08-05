/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
// import validateForm from './incidentRoleValidation'
import { FormError } from '../../@types/template'
import { User } from '../../data/hmppsAuthClient'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import validatePrisonerSearch from '../util/incidentSearchValidation'
import { popDataFromSession } from './associatedPrisonerCache'
import {
  AssociatedPrisonerLocation,
  getDraftIdFromString,
  extractAssociatedDetails,
  getPrisonerLocation,
  RoleAssociatedPrisoner,
} from './associatedPrisonerUtils'

export enum PageRequestType {
  EDIT,
  EDIT_SUBMITTED,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

type DisplayData = {
  prisoner: PrisonerResultSummary
  associatedPrisonersName?: string
  associatedPrisonerNumber?: string
  location?: AssociatedPrisonerLocation
}

export default class IncidentAssistPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = getDraftIdFromString(req.params.adjudicationNumber)
    const fromDelete = req.query.personDeleted as string
    const fromSearch = JSON.stringify(req.query.selectedPerson)?.replace(/"/g, '')
    let roleAssociatedPrisoner = await this.readFromApi(draftId, user as User)

    if (fromSearch) {
      roleAssociatedPrisoner = {
        prisonerNumber: roleAssociatedPrisoner.prisonerNumber,
        currentAssociatedPrisonerNumber: fromSearch,
      }
    } else if (fromDelete) {
      roleAssociatedPrisoner = {
        prisonerNumber: roleAssociatedPrisoner.prisonerNumber,
      }
    }
    const pageData = await this.getDisplayData(roleAssociatedPrisoner, user as User)

    renderData(res, draftId, pageData, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body)
    if (req.body.deleteUser) {
      return this.delete(req, res)
    }
    if (req.body.searchUser) {
      return this.search(req, res)
    }
    return this.save(req, res)
  }

  save = async (req: Request, res: Response) => {
    console.log('todo')
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    return redirectToDeletePersonPage(res, req.body.prisonerId)
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const user = res.locals
    const draftId = getDraftIdFromString(req.params.adjudicationNumber)

    req.session.redirectUrl = adjudicationUrls.incidentAssist.urls.start(draftId)

    const searchValidationError = validatePrisonerSearch({
      searchTerm: req.body.prisonerSearchNameInput,
    })
    if (searchValidationError) {
      const pageData = await this.getDisplayData(
        {
          prisonerNumber: req.body.prisonerSearchNameInput,
          currentAssociatedPrisonerNumber: req.body.prisonerSearchNameInput,
        },
        user as User
      )

      return renderData(res, draftId, pageData, searchValidationError)
    }
    return redirectToSearchForPersonPage(res, req.body.prisonerSearchNameInput)
  }

  readFromApi = async (draftId: number, user: User): Promise<RoleAssociatedPrisoner> => {
    return extractAssociatedDetails(await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user))
  }

  getDisplayData = async (roleAssociatedPrisoner: RoleAssociatedPrisoner, currentUser: User): Promise<DisplayData> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(
      roleAssociatedPrisoner.prisonerNumber,
      currentUser
    )
    const location = getPrisonerLocation(roleAssociatedPrisoner)
    let associatedPrisonersName

    switch (location) {
      case AssociatedPrisonerLocation.EXTERNAL:
        associatedPrisonersName = roleAssociatedPrisoner.currentAssociatedPrisonerName
        break
      case AssociatedPrisonerLocation.INTERNAL:
        associatedPrisonersName = roleAssociatedPrisoner.currentAssociatedPrisonerNumber
          ? await this.getCurrentAssociatedPrisonersName(
              roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
              currentUser
            )
          : null
        break
      default:
    }

    return {
      prisoner,
      associatedPrisonersName,
      associatedPrisonerNumber: roleAssociatedPrisoner.currentAssociatedPrisonerNumber,
      location: location === AssociatedPrisonerLocation.UNKNOWN ? null : location,
    }
  }

  getCurrentAssociatedPrisonersName = async (associatedPrisonersNumber: string, user: User) => {
    if (!associatedPrisonersNumber) return null
    const associatedPrisoner = await this.placeOnReportService.getPrisonerDetails(associatedPrisonersNumber, user)
    return associatedPrisoner.displayName
  }
}

const redirectToSearchForPersonPage = (res: Response, searchTerm: string) => {
  return res.redirect(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=${searchTerm}`)
}

const redirectToDeletePersonPage = (res: Response, prisonerToDelete: string) => {
  return res.redirect(`${adjudicationUrls.deletePerson.root}?associatedPersonId=${prisonerToDelete}`)
}

const renderData = (res: Response, draftId: number, pageData: DisplayData, error: FormError) => {
  return res.render(`pages/incidentAssist`, {
    errors: error ? [error] : [],
    exitButtonHref: adjudicationUrls.taskList.urls.start(draftId),
    decisionData: {
      selectedAnswerId: pageData.location,
      selectedAnswerData: {
        otherPersonNameInput:
          pageData.location === AssociatedPrisonerLocation.EXTERNAL ? pageData.associatedPrisonersName : null,
        prisonerNumberInput:
          pageData.location === AssociatedPrisonerLocation.EXTERNAL ? pageData.associatedPrisonerNumber : null,
        prisonerId:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonerNumber : null,
        // TODO this should be from cache i think.
        prisonerSearchNameInput:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonersName : null,
        prisonerName:
          pageData.location === AssociatedPrisonerLocation.INTERNAL ? pageData.associatedPrisonersName : null,
      },
    },
    viewData: {
      prisonerName: pageData.associatedPrisonersName,
    },
    prisoner: pageData.prisoner,
  })
}
