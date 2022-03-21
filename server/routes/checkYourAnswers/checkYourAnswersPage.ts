/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import { CheckYourAnswers } from '../../data/DraftAdjudicationResult'

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
      editIncidentDetailsURL: `/incident-details/${prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisonerNumber}/${adjudicationNumber}/report`,
      editIncidentStatementURL: `/incident-statement/${prisonerNumber}/${adjudicationNumber}/submitted/edit`,
      exitUrl: `/prisoner-report/${prisonerNumber}/${incidentDetailsData.adjudicationNumber}/report`,
    }
  }
  if (pageOptions.isEditByReviewer()) {
    return {
      editIncidentDetailsURL: `/incident-details/${prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisonerNumber}/${adjudicationNumber}/review`,
      exitUrl: `/prisoner-report/${prisonerNumber}/${incidentDetailsData.adjudicationNumber}/review`,
    }
  }
  return {
    editIncidentDetailsURL: `/incident-details/${prisonerNumber}/${adjudicationNumber}/edit`,
    editIncidentStatementURL: `/incident-statement/${prisonerNumber}/${adjudicationNumber}`,
    exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`,
  }
}

const getRedirectUrls = (pageOptions: PageOptions, completeAdjudicationNumber: number) => {
  if (pageOptions.isEditByReporter())
    return `/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/report`
  if (pageOptions.isEditByReviewer())
    return `/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/review`
  return `/prisoner-placed-on-report/${completeAdjudicationNumber}`
}

const getErrorRedirectUrl = (pageOptions: PageOptions, prisonerNumber: string, adjudicationNumber: number) => {
  if (pageOptions.isEditByReporter()) return `/your-completed-reports`
  if (pageOptions.isEditByReviewer()) return `/all-completed-reports`
  return `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`
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

    const { adjudicationNumber, draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.adjudicationData(Number(req.params.adjudicationNumber), user)
    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )
    const incidentDetailsData = await this.placeOnReportService.getCheckYourAnswersInfo(
      adjudicationNumber,
      incidentLocations,
      user
    )
    const allOffenceData = await this.decisionTreeService.allOffences(adjudicationNumber, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      allOffenceData,
      prisoner,
      associatedPrisoner,
      incidentRole,
      draftAdjudication,
      user
    )

    const checkAnswersVariations = getVariablesForPageType(
      this.pageOptions,
      prisoner.prisonerNumber,
      adjudicationNumber,
      incidentDetailsData
    )

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
    const { prisonerNumber } = req.params
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    try {
      const completeAdjudicationNumber = await this.placeOnReportService.completeDraftAdjudication(
        adjudicationNumber,
        user
      )
      const redirectUrl = getRedirectUrls(this.pageOptions, completeAdjudicationNumber)
      return res.redirect(redirectUrl)
    } catch (postError) {
      const errorRedirectUrl = getErrorRedirectUrl(this.pageOptions, prisonerNumber, adjudicationNumber)
      res.locals.redirectUrl = errorRedirectUrl
      throw postError
    }
  }
}
