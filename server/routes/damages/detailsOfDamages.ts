/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DamageDetails, DraftAdjudication } from '../../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export enum PageRequestType {
  DAMAGES_FROM_API,
  DAMAGES_FROM_SESSION,
  SUBMITTED_EDIT_DAMAGES_FROM_API,
  SUBMITTED_EDIT_DAMAGES_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.DAMAGES_FROM_SESSION
  }

  displayAPIDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_DAMAGES_FROM_API
  }

  displaySessionDataSubmitted(): boolean {
    return this.pageType === PageRequestType.SUBMITTED_EDIT_DAMAGES_FROM_SESSION
  }
}

export default class DetailsOfDamagesPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly damagesSessionService: DamagesSessionService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const damageToDelete = Number(req.query.delete) || null
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const prisonerReportUrl = adjudicationUrls.prisonerReport.urls.review(adjudicationNumber)
    const addDamagesUrl = adjudicationUrls.detailsOfDamages.urls.add(adjudicationNumber)

    // here we need to get the reported adjudication details rather than the draft for when the reported adjudication is being edited ??
    // if (displayAPIDataSubmitted || displaySessionDataSubmitted) {
    // }

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
      currentUser: user.username,
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
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const { reportedAdjudicationNumber } = req.body

    // If displaying data on draft, nothing has changed so no save needed - unless it's the first time viewing the page, when we need to record that the page visit
    if (!this.pageOptions.displaySessionData() && draftAdjudication.damagesSaved) {
      this.damagesSessionService.deleteAllSessionDamages(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber)
    }

    const damagesOnSession = this.damagesSessionService.getAndDeleteAllSessionDamages(req, adjudicationNumber)
    const damagesToSend = this.formatDamages(damagesOnSession)

    if (reportedAdjudicationNumber) {
      await this.reportedAdjudicationsService.updateDamageDetails(reportedAdjudicationNumber, damagesToSend, user)
    } else {
      await this.placeOnReportService.saveDamageDetails(adjudicationNumber, damagesToSend, user)
    }
    return this.redirectToNextPage(res, adjudicationNumber)
  }

  getDamages = (req: Request, adjudicationNumber: number, draftAdjudication: DraftAdjudication) => {
    if (this.pageOptions.displaySessionData()) {
      return this.damagesSessionService.getAllSessionDamages(req, adjudicationNumber)
    }

    return this.formatDamages(draftAdjudication.damages)
  }

  formatDamages = (damages: DamageDetails[]) => {
    if (!damages) return []
    return damages.map(damage => ({
      code: damage.code,
      details: damage.details,
      reporter: damage.reporter,
    }))
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number) => {
    return res.redirect(adjudicationUrls.detailsOfEvidence.urls.start(adjudicationNumber))
  }
}
