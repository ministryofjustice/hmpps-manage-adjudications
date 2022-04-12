/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import { CheckYourAnswers } from '../../data/DraftAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError | FormError[]
}

export enum PageRequestType {
  CREATION,
  EDIT_REPORTER,
  EDIT_REVIEWER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isCreation(): boolean {
    return this.pageType !== PageRequestType.EDIT_REPORTER && this.pageType !== PageRequestType.EDIT_REVIEWER
  }

  isEditByReporter(): boolean {
    return this.pageType === PageRequestType.EDIT_REPORTER
  }

  isEditByReviewer(): boolean {
    return this.pageType === PageRequestType.EDIT_REVIEWER
  }
}

const getVariablesForPageType = (
  pageOptions: PageOptions,
  prisonerNumber: string,
  adjudicationNumber: number,
  incidentDetailsData: CheckYourAnswers
) => {
  if (pageOptions.isEditByReporter()) {
    return {
      editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        prisonerNumber,
        adjudicationNumber
      )}?referrer=${adjudicationUrls.checkYourAnswers.urls.report(adjudicationNumber)}`,
      editIncidentStatementURL: adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber),
      exitUrl: adjudicationUrls.prisonerReport.urls.report(incidentDetailsData.adjudicationNumber),
    }
  }
  if (pageOptions.isEditByReviewer()) {
    return {
      // We don't have the editIncidentStatementURL variable here as reviewers cannot change the statement.
      editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        prisonerNumber,
        adjudicationNumber
      )}?referrer=${adjudicationUrls.checkYourAnswers.urls.review(adjudicationNumber)}`,
      exitUrl: adjudicationUrls.prisonerReport.urls.review(incidentDetailsData.adjudicationNumber),
    }
  }
  return {
    editIncidentDetailsURL: adjudicationUrls.incidentDetails.urls.edit(prisonerNumber, adjudicationNumber),
    editIncidentStatementURL: adjudicationUrls.incidentStatement.urls.start(adjudicationNumber),
    exitUrl: adjudicationUrls.taskList.urls.start(adjudicationNumber),
  }
}

const getRedirectUrls = (pageOptions: PageOptions, completeAdjudicationNumber: number) => {
  if (pageOptions.isEditByReporter())
    return adjudicationUrls.confirmedOnReport.urls.reporterView(completeAdjudicationNumber)
  if (pageOptions.isEditByReviewer())
    return adjudicationUrls.confirmedOnReport.urls.reviewerView(completeAdjudicationNumber)
  return adjudicationUrls.confirmedOnReport.urls.start(completeAdjudicationNumber)
}

const getErrorRedirectUrl = (pageOptions: PageOptions, adjudicationNumber: number) => {
  if (pageOptions.isEditByReporter()) return adjudicationUrls.yourCompletedReports.root
  if (pageOptions.isEditByReviewer()) return adjudicationUrls.allCompletedReports.root
  return adjudicationUrls.taskList.urls.start(adjudicationNumber)
}

export default class CheckYourAnswersPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { draftAdjudication, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(adjudicationNumber, user)

    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )

    const incidentDetailsData = await this.placeOnReportService.getCheckYourAnswersInfo(
      adjudicationNumber,
      incidentLocations,
      user
    )

    const [offences, checkAnswersVariations] = await Promise.all([
      this.decisionTreeService.getAdjudicationOffences(
        draftAdjudication.offenceDetails,
        prisoner,
        associatedPrisoner,
        draftAdjudication.incidentRole,
        user
      ),
      getVariablesForPageType(this.pageOptions, prisoner.prisonerNumber, adjudicationNumber, incidentDetailsData),
    ])

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      incidentDetailsData,
      adjudicationNumber,
      offences,
      creationJourney: this.pageOptions.isCreation(),
      statementEditable: !this.pageOptions.isEditByReviewer(),
      submitButtonText: this.pageOptions.isCreation() ? 'Accept and place on report' : 'Confirm changes',
      secondaryButtonText: this.pageOptions.isCreation() ? 'Exit' : 'Cancel',
      ...checkAnswersVariations,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    try {
      const completeAdjudicationNumber = await this.placeOnReportService.completeDraftAdjudication(
        adjudicationNumber,
        user
      )
      const redirectUrl = getRedirectUrls(this.pageOptions, completeAdjudicationNumber)
      return res.redirect(redirectUrl)
    } catch (postError) {
      const errorRedirectUrl = getErrorRedirectUrl(this.pageOptions, adjudicationNumber)
      res.locals.redirectUrl = errorRedirectUrl
      throw postError
    }
  }
}
