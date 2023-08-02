/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DamageDetails, DraftAdjudication } from '../../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { User } from '../../data/hmppsAuthClient'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import DamagesEvidenceWitnessHelper from '../../utils/damagesEvidenceWitnessesHelper'

export enum PageRequestType {
  DAMAGES_FROM_API,
  DAMAGES_FROM_SESSION,
  SUBMITTED_EDIT_DAMAGES_FROM_API,
  SUBMITTED_EDIT_DAMAGES_FROM_SESSION,
}

class PageOptions extends DamagesEvidenceWitnessHelper {
  constructor(private readonly pageType: PageRequestType) {
    super()
  }

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
    const { chargeNumber } = req.params
    const damageToDelete = Number(req.query.delete) || null
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()
    const exitButtonHref = this.getExitUrl(req, chargeNumber, isSubmittedEdit)

    const { adjudication, prisoner } = await this.getAdjudicationAndPrisoner(chargeNumber, isSubmittedEdit, user)
    const addDamagesUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfDamages.urls.add(chargeNumber)}?submitted=true`
      : `${adjudicationUrls.detailsOfDamages.urls.add(chargeNumber)}?submitted=false`

    const redirectAfterRemoveUrl = isSubmittedEdit
      ? `${adjudicationUrls.detailsOfDamages.urls.submittedEditModified(chargeNumber)}?delete=`
      : `${adjudicationUrls.detailsOfDamages.urls.modified(chargeNumber)}?delete=`

    const damages = this.getDamages(req, chargeNumber, adjudication)

    // If we are not displaying session data then fill in the session data
    if (this.pageOptions.isShowingAPIData()) {
      // Set up session to allow for adding and deleting
      this.damagesSessionService.setAllSessionDamages(req, damages, chargeNumber)
    }

    if (damageToDelete) {
      this.damagesSessionService.deleteSessionDamage(req, damageToDelete, chargeNumber)
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
      chargeNumber,
      damages,
      prisoner,
      redirectAfterRemoveUrl,
      exitButtonHref,
      addDamagesButtonHref: addDamagesUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const isSubmittedEdit = this.pageOptions.isSubmittedEdit()

    const draftAdjudicationResult = !isSubmittedEdit
      ? await this.placeOnReportService.getDraftAdjudicationDetails(Number(chargeNumber), user)
      : null

    const referrer = this.damagesSessionService.getAndDeleteReferrerOnSession(req)

    // If displaying data from API, nothing has changed so no save needed - unless it's the first time viewing the page, when we need to record that the page visit
    if (this.pageOptions.isShowingAPIDataAndPageVisited(draftAdjudicationResult?.draftAdjudication.damagesSaved)) {
      this.damagesSessionService.deleteReferrerOnSession(req)
      this.damagesSessionService.deleteAllSessionDamages(req, chargeNumber)
      return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
    }

    const damagesOnSession = this.damagesSessionService.getAndDeleteAllSessionDamages(req, chargeNumber)
    const damagesToSend = this.formatDamages(damagesOnSession)

    if (isSubmittedEdit) {
      await this.reportedAdjudicationsService.updateDamageDetails(chargeNumber, damagesToSend, user)
    } else {
      await this.placeOnReportService.saveDamageDetails(chargeNumber, damagesToSend, user)
    }
    return this.redirectToNextPage(res, chargeNumber, isSubmittedEdit, referrer)
  }

  getAdjudicationAndPrisoner = async (chargeNumber: string, isSubmittedEdit: boolean, user: User) => {
    if (!isSubmittedEdit) {
      const chargeNo = Number(chargeNumber)
      const [draftAdjudicationResult, prisoner] = await Promise.all([
        this.placeOnReportService.getDraftAdjudicationDetails(chargeNo, user),
        this.placeOnReportService.getPrisonerDetailsFromAdjNumber(chargeNo, user),
      ])
      const { draftAdjudication } = draftAdjudicationResult
      return { adjudication: draftAdjudication, prisoner }
    }
    const [reportedAdjudicationResult, prisoner] = await Promise.all([
      this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user),
      this.reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber(chargeNumber, user),
    ])
    const { reportedAdjudication } = reportedAdjudicationResult
    return { adjudication: reportedAdjudication, prisoner }
  }

  getExitUrl = (req: Request, chargeNumber: string, isSubmittedEdit: boolean) => {
    const taskListUrl = adjudicationUrls.taskList.urls.start(chargeNumber)
    const prisonerReportUrl = req.query.referrer as string
    if (this.pageOptions.displayAPIDataSubmitted() && prisonerReportUrl)
      this.damagesSessionService.setReferrerOnSession(req, prisonerReportUrl, chargeNumber)
    return isSubmittedEdit ? this.damagesSessionService.getReferrerFromSession(req) : taskListUrl
  }

  getDamages = (req: Request, chargeNumber: string, draftAdjudication: DraftAdjudication | ReportedAdjudication) => {
    if (this.pageOptions.isShowingSessionData()) {
      return this.damagesSessionService.getAllSessionDamages(req, chargeNumber)
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

  redirectToNextPage = (res: Response, chargeNumber: string, isSubmittedEdit: boolean, referrer: string) => {
    if (isSubmittedEdit)
      return res.redirect(
        `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(chargeNumber)}?referrer=${referrer}`
      )
    return res.redirect(adjudicationUrls.detailsOfEvidence.urls.start(chargeNumber))
  }
}
