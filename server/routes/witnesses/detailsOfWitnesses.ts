/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import WitnessesSessionService from '../../services/witnessesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'

export enum PageRequestType {
  WITNESSES_FROM_API,
  WITNESSES_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.WITNESSES_FROM_SESSION
  }
}

export default class DetailsOfWitnessesPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly witnessesSessionService: WitnessesSessionService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    // draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const witnessToDelete = Number(req.query.delete) || null
    const taskListUrl = adjudicationUrls.taskList.urls.start(adjudicationNumber)
    const addWitnessUrl = adjudicationUrls.detailsOfWitnesses.urls.add(adjudicationNumber)

    const [draftAdjudicationResult, prisoner] = await Promise.all([
      this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user),
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(adjudicationNumber, user),
    ])
    const { draftAdjudication } = draftAdjudicationResult
    const reportedAdjudicationNumber = draftAdjudication.adjudicationNumber
    const witnesses = this.getWitnesses(req, adjudicationNumber, draftAdjudication)

    // If we are not displaying session data then fill in the session data
    if (!this.pageOptions.displaySessionData()) {
      // Set up session to allow for adding and deleting
      this.witnessesSessionService.setAllSessionWitnesses(req, witnesses, adjudicationNumber)
    }

    if (witnessToDelete) {
      this.witnessesSessionService.deleteSessionWitness(req, witnessToDelete, adjudicationNumber)
    }

    if (!witnesses || witnesses.length < 1) {
      return res.render(`pages/detailsOfWitnesses`, {
        prisoner,
        exitButtonHref: taskListUrl,
        addWitnessButtonHref: addWitnessUrl,
      })
    }

    return res.render(`pages/detailsOfWitnesses`, {
      currentUser: user.username,
      adjudicationNumber,
      reportedAdjudicationNumber,
      witnesses,
      prisoner,
      redirectAfterRemoveUrl: `${adjudicationUrls.detailsOfWitnesses.urls.modified(adjudicationNumber)}?delete=`,
      exitButtonHref: taskListUrl,
      addWitnessButtonHref: addWitnessUrl,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isReportedAdjudication = !!req.body.reportedAdjudicationNumber

    // If displaying data on draft, nothing has changed so no save needed
    if (!this.pageOptions.displaySessionData()) {
      this.witnessesSessionService.deleteAllSessionWitnesses(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
    }

    const witnessDetails = this.witnessesSessionService.getAndDeleteAllSessionWitnesses(req, adjudicationNumber)

    await this.placeOnReportService.saveWitnessDetails(adjudicationNumber, witnessDetails, user)
    return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
  }

  getWitnesses = (req: Request, adjudicationNumber: number, draftAdjudication: DraftAdjudication) => {
    if (this.pageOptions.displaySessionData()) {
      return this.witnessesSessionService.getAllSessionWitnesses(req, adjudicationNumber)
    }

    return draftAdjudication.witnesses || []
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
