/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { CheckYourAnswers, DraftAdjudication } from '../../data/DraftAdjudicationResult'
import adjudicationUrls from '../../utils/urlGenerator'
import { User } from '../../data/hmppsManageUsersClient'

type PageData = {
  error?: FormError | FormError[]
}

export enum PageRequestType {
  CREATION,
  EDIT_REPORTER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isCreation(): boolean {
    return this.pageType !== PageRequestType.EDIT_REPORTER
  }

  isEditByReporter(): boolean {
    return this.pageType === PageRequestType.EDIT_REPORTER
  }
}

const getVariablesForPageType = (
  pageOptions: PageOptions,
  prisonerNumber: string,
  draftId: number,
  incidentDetailsData: CheckYourAnswers
) => {
  if (pageOptions.isEditByReporter()) {
    return {
      editIncidentDetailsURL: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        prisonerNumber,
        draftId
      )}?referrer=${adjudicationUrls.checkYourAnswers.urls.report(draftId)}`,
      editIncidentStatementURL: adjudicationUrls.incidentStatement.urls.submittedEdit(draftId),
      editOffenceDetailsURL: adjudicationUrls.ageOfPrisoner.urls.submittedEdit(draftId),
      exitUrl: adjudicationUrls.prisonerReport.urls.report(incidentDetailsData.chargeNumber),
      editDamagesURL: adjudicationUrls.detailsOfDamages.urls.start(draftId),
      editEvidenceURL: adjudicationUrls.detailsOfEvidence.urls.start(draftId),
      editWitnessesURL: adjudicationUrls.detailsOfWitnesses.urls.start(draftId),
    }
  }
  return {
    editIncidentDetailsURL: adjudicationUrls.incidentDetails.urls.edit(prisonerNumber, draftId),
    editOffenceDetailsURL: adjudicationUrls.ageOfPrisoner.urls.start(draftId),
    editIncidentStatementURL: adjudicationUrls.incidentStatement.urls.start(draftId),
    editDamagesURL: adjudicationUrls.detailsOfDamages.urls.start(draftId),
    editEvidenceURL: adjudicationUrls.detailsOfEvidence.urls.start(draftId),
    editWitnessesURL: adjudicationUrls.detailsOfWitnesses.urls.start(draftId),
    exitUrl: adjudicationUrls.taskList.urls.start(draftId),
  }
}

const getRedirectUrls = (pageOptions: PageOptions, completedChargeNumber: string) => {
  if (pageOptions.isEditByReporter())
    return adjudicationUrls.confirmedOnReport.urls.confirmationOfChange(completedChargeNumber)
  return adjudicationUrls.confirmedOnReport.urls.start(completedChargeNumber)
}

const getErrorRedirectUrl = (pageOptions: PageOptions, draftId: number) => {
  if (pageOptions.isEditByReporter()) return adjudicationUrls.yourCompletedReports.root
  return adjudicationUrls.taskList.urls.start(draftId)
}

export default class CheckYourAnswersPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  getReviewData = async (draftAdjudication: DraftAdjudication, user: User) => {
    const reportedAdjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      draftAdjudication.chargeNumber,
      user
    )
    return this.reportedAdjudicationsService.getReviewDetails(reportedAdjudication.reportedAdjudication, user)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { user } = res.locals
    const draftId = Number(req.params.draftId)
    const { draftAdjudication, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)

    const incidentLocations = await this.locationService.getIncidentLocations(user.activeCaseLoadId, user)

    const incidentDetailsData = await this.placeOnReportService.getCheckYourAnswersInfo(
      draftId,
      incidentLocations,
      user
    )

    const userSetGenderData = await this.placeOnReportService.getGenderDataForTable(
      this.pageOptions.isCreation(),
      prisoner,
      draftAdjudication
    )

    // The reported adjudication number won't exist in the creation journey
    // Whilst  we're passing in a draftAdjudication here, it's a duplication of a reported adjudication, so it will have the reported adjudication number, which is what we need
    const reviewData = this.pageOptions.isEditByReporter() ? await this.getReviewData(draftAdjudication, user) : null

    const [offences, checkAnswersVariations] = await Promise.all([
      this.decisionTreeService.getAdjudicationOffences(
        draftAdjudication.offenceDetails,
        prisoner,
        associatedPrisoner,
        draftAdjudication.incidentRole,
        user,
        false
      ),
      getVariablesForPageType(this.pageOptions, prisoner.prisonerNumber, draftId, incidentDetailsData),
    ])

    const convertedEvidence = await this.reportedAdjudicationsService.convertEvidenceToTableFormat(
      draftAdjudication.evidence
    )

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      incidentDetailsData,
      draftId,
      offences,
      creationJourney: this.pageOptions.isCreation(),
      statementEditable: true,
      submitButtonText: this.pageOptions.isCreation() ? 'Accept and place on report' : 'Confirm changes',
      secondaryButtonText: this.pageOptions.isCreation() ? 'Exit' : 'Cancel',
      ...checkAnswersVariations,
      reviewData,
      userSetGenderData,
      damages: draftAdjudication.damages,
      evidence: convertedEvidence,
      witnesses: draftAdjudication.witnesses,
      editAndReviewAvailability: {
        incidentDetailsEditable: true,
        offencesEditable: true,
        statementEditable: true,
        damagesEvidenceWitnessesEditable: true,
        reviewAvailable: false,
      },
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = Number(req.params.draftId)

    try {
      const completedChargeNumber = await this.placeOnReportService.completeDraftAdjudication(draftId, user)
      const redirectUrl = getRedirectUrls(this.pageOptions, completedChargeNumber)
      return res.redirect(redirectUrl)
    } catch (postError) {
      const errorRedirectUrl = getErrorRedirectUrl(this.pageOptions, draftId)
      res.locals.redirectUrl = errorRedirectUrl
      throw postError
    }
  }
}
