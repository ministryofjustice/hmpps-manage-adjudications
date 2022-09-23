/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DamageDetails, DraftAdjudication } from '../../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { User } from '../../data/hmppsAuthClient'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  DAMAGES_FROM_API,
  DAMAGES_FROM_SESSION,
  SUBMITTED_EDIT_DAMAGES_FROM_API,
  SUBMITTED_EDIT_DAMAGES_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.DAMAGES_FROM_API
  }

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
    const isSubmittedEdit = this.pageOptions.displayAPIDataSubmitted() || this.pageOptions.displaySessionDataSubmitted()
    const exitButtonHref = this.getExitUrl(req, adjudicationNumber, isSubmittedEdit)

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(adjudicationNumber, isSubmittedEdit, user)
    const addDamagesUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfDamages.urls.add(adjudicationNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfDamages.urls.add(adjudicationNumber)}?submitted=false`

    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfDamages.urls.submittedEditModified(adjudicationNumber)}?delete=`
      : `${adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber)}?delete=`

    const damages = this.getDamages(req, adjudicationNumber, adjudication)

    // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData() || this.pageOptions.displayAPIDataSubmitted()) {
      // Set up session to allow for adding and deleting
      this.damagesSessionService.setAllSessionDamages(req, damages, adjudicationNumber)
    }

    if (damageToDelete) {
      this.damagesSessionService.deleteSessionDamage(req, damageToDelete, adjudicationNumber)
    }

    if (!damages || damages.length < 1) {
      return res.render(`pages/detailsOfDamages`, {
        prisoner,
        exitButtonHref,
        addDamagesButtonHref: addDamagesUrl,
      })
    }

    return res.render(`pages/detailsOfDamages`, {
      currentUser: user.username,
      adjudicationNumber,
      damages,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addDamagesButtonHref: addDamagesUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isSubmittedEdit = this.pageOptions.displaySessionDataSubmitted() || this.pageOptions.displayAPIDataSubmitted()

    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
      : null

    // If displaying data from API, nothing has changed so no save needed - unless it's the first time viewing the page, when we need to record that the page visit
    if (
      (this.pageOptions.displayAPIData() && draftAdjudicationResult.draftAdjudication.damagesSaved) ||
      this.pageOptions.displayAPIDataSubmitted()
    ) {
      this.damagesSessionService.deleteReferrerOnSession(req)
      this.damagesSessionService.deleteAllSessionDamages(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isSubmittedEdit)
    }

    const damagesOnSession = this.damagesSessionService.getAndDeleteAllSessionDamages(req, adjudicationNumber)
    this.damagesSessionService.deleteReferrerOnSession(req)
    const damagesToSend = this.formatDamages(damagesOnSession)

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateDamageDetails(adjudicationNumber, damagesToSend, user)
    } else {
      await this.placeOnReportService.saveDamageDetails(adjudicationNumber, damagesToSend, user)
    }
    return this.redirectToNextPage(res, adjudicationNumber, !!isSubmittedEdit)
  }

  getAdjudicationAndPrisoner = async (adjudicationNumber: number, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      const [draftAdjudicationResult, prisoner] = await Promise.all([
        this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user),
        this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
      ])
      const { draftAdjudication } = draftAdjudicationResult
      return { adjudication: draftAdjudication, prisoner }
    }
    const [reportedAdjudicationResult, prisoner] = await Promise.all([
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(adjudicationNumber, user),
      this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
    ])
    const { reportedAdjudication } = reportedAdjudicationResult
    return { adjudication: reportedAdjudication, prisoner }
  }

  getExitUrl = (req: Request, adjudicationNumber: number, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (this.pageOptions.displayAPIDataSubmitted() && prisonerReportUrl)
      this.damagesSessionService.setReferrerOnSession(req, prisonerReportUrl)
    return isSubmittedEdit ? this.damagesSessionService.getReferrerFromSession(req) : taskListUrl
  }

  getDamages = (
    req: Request,
    adjudicationNumber: number,
    draftAdjudication: DraftAdjudication | ReportedAdjudication
  ) => {
    if (this.pageOptions.displaySessionData() || this.pageOptions.displaySessionDataSubmitted()) {
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

  redirectToNextPage = (res: Response, adjudicationNumber: number, isSubmittedEdit: boolean) => {
    if (isSubmittedEdit) return res.redirect(adjudicationUrls.detailsOfEvidence.urls.submittedEdit(adjudicationNumber))
    return res.redirect(adjudicationUrls.detailsOfEvidence.urls.start(adjudicationNumber))
  }
}
