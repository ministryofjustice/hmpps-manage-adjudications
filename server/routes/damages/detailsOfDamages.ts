/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'

type DisplayDamage = {
  type: string
  description: string
  reporter: string
}

export enum PageRequestType {
  DAMAGES_FROM_API,
  DAMAGES_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.DAMAGES_FROM_SESSION
  }
}

export default class DetailsOfDamagesPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly damagesSessionService: DamagesSessionService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    // draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const damageToDelete = Number(req.query.delete) || null
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const addDamagesUrl = adjudicationUrls.detailsOfDamages.urls.add(adjudicationNumber)

    const [draftAdjudicationResult, prisoner] = await Promise.all([
      this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user),
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
    ])
    const { draftAdjudication } = draftAdjudicationResult
    const reportedAdjudicationNumber = draftAdjudication.adjudicationNumber
    const damages = this.getDamages(req, adjudicationNumber, draftAdjudication)

    // If we are not displaying session data then fill in the session data
    if (!this.pageOptions.displaySessionData()) {
      // Set up session to allow for adding and deleting
      this.damagesSessionService.setAllSessionDamages(req, damages, adjudicationNumber)
    }

    if (damageToDelete) {
      this.damagesSessionService.deleteSessionDamage(req, damageToDelete, adjudicationNumber)
    }

    if (!damages || damages.length < 1) {
      return res.render(`pages/detailsOfDamages`, {
        prisoner,
        exitButtonHref: taskListUrl,
        addDamagesButtonHref: addDamagesUrl,
      })
    }
    return res.render(`pages/detailsOfDamages`, {
      adjudicationNumber,
      reportedAdjudicationNumber,
      damages,
      prisoner,
      redirectAfterRemoveUrl: `${adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber)}?delete=`,
      exitButtonHref: taskListUrl,
      addDamagesButtonHref: addDamagesUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isReportedAdjudication = !!req.body.reportedAdjudicationNumber

    // If displaying data on draft, nothing has changed so no save needed
    if (!this.pageOptions.displaySessionData()) {
      this.damagesSessionService.deleteAllSessionDamages(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
    }

    const damageDetails = this.damagesSessionService
      .getAndDeleteAllSessionDamages(req, adjudicationNumber)
      .map((damages: DisplayDamage) => {
        return {
          code: damages.type,
          details: damages.description,
          reporter: damages.reporter,
        }
      })

    await this.placeOnReportService.saveDamageDetails(adjudicationNumber, damageDetails, user)
    return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
  }

  getDamages = (req: Request, adjudicationNumber: number, draftAdjudication: DraftAdjudication) => {
    if (this.pageOptions.displaySessionData()) {
      return this.damagesSessionService.getAllSessionDamages(req, adjudicationNumber)
    }

    return (
      draftAdjudication.damages?.map(damageDetails => {
        return {
          type: damageDetails.code,
          description: damageDetails.details,
          reporter: damageDetails.reporter,
        }
      }) || []
    )
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    // TODO This will be the new evidence section but until it is built this can go to the incident statement page
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
