/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'

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

  isEditByReporter(): boolean {
    return this.pageType === PageRequestType.EDIT_REPORTER
  }

  isEditByReviewer(): boolean {
    return this.pageType === PageRequestType.EDIT_REVIEWER
  }
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
    const { prisonerNumber } = req.params
    const { user } = res.locals

    const { adjudicationNumber, draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.adjudicationData(Number(req.params.adjudicationNumber), user)
    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )
    const data = await this.placeOnReportService.getCheckYourAnswersInfo(adjudicationNumber, incidentLocations, user)
    const allOffenceData = await this.decisionTreeService.allOffences(adjudicationNumber, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      allOffenceData,
      prisoner,
      associatedPrisoner,
      incidentRole,
      draftAdjudication,
      user
    )

    // ORIGINAL
    // editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/edit`,
    // editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}`,
    // statementEditable: true,
    // creationJourney: true,
    // submitButtonText: 'Accept and place on report',
    // secondaryButtonText: 'Exit',
    // exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`,

    // REPORTER
    // editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisoner.prisonerNumber}/${adjudicationNumber}/report`,
    // editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit`,
    // statementEditable: true,
    // creationJourney: false,
    // submitButtonText: 'Confirm changes',
    // secondaryButtonText: 'Cancel',
    // exitUrl: `/prisoner-report/${prisonerNumber}/${data.adjudicationNumber}/report`,

    // REVIEWER
    // editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisoner.prisonerNumber}/${adjudicationNumber}/review`,
    // statementEditable: false,
    // creationJourney: false,
    // submitButtonText: 'Confirm changes',
    // secondaryButtonText: 'Cancel',
    // exitUrl: `/prisoner-report/${prisonerNumber}/${data.adjudicationNumber}/review`,

    let checkAnswersVariations
    if (this.pageOptions.isEditByReporter()) {
      checkAnswersVariations = {
        editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisoner.prisonerNumber}/${adjudicationNumber}/report`,
        editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit`,
        statementEditable: true,
        creationJourney: false,
        submitButtonText: 'Confirm changes',
        secondaryButtonText: 'Cancel',
        exitUrl: `/prisoner-report/${prisonerNumber}/${data.adjudicationNumber}/report`,
      }
    } else if (this.pageOptions.isEditByReviewer()) {
      checkAnswersVariations = {
        editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisoner.prisonerNumber}/${adjudicationNumber}/review`,
        statementEditable: false,
        creationJourney: false,
        submitButtonText: 'Confirm changes',
        secondaryButtonText: 'Cancel',
        exitUrl: `/prisoner-report/${prisonerNumber}/${data.adjudicationNumber}/review`,
      }
    } else {
      checkAnswersVariations = {
        editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/edit`,
        editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}`,
        statementEditable: true,
        creationJourney: true,
        submitButtonText: 'Accept and place on report',
        secondaryButtonText: 'Exit',
        exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`,
      }
    }

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      data,
      adjudicationNumber,
      offences,
      ...checkAnswersVariations,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonerNumber } = req.params
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    let redirectUrl
    let errorRedirectUrl

    try {
      const completeAdjudicationNumber = await this.placeOnReportService.completeDraftAdjudication(
        adjudicationNumber,
        user
      )
      if (this.pageOptions.isEditByReporter()) {
        redirectUrl = `/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/report`
        errorRedirectUrl = `/your-completed-reports`
      } else if (this.pageOptions.isEditByReviewer()) {
        redirectUrl = `/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/review`
        errorRedirectUrl = `/all-completed-reports`
      } else {
        redirectUrl = `/prisoner-placed-on-report/${completeAdjudicationNumber}`
        errorRedirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`
      }
      return res.redirect(redirectUrl)
    } catch (postError) {
      res.locals.redirectUrl = errorRedirectUrl
      throw postError
    }
  }
}

// REPORTER
// return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/report`)
// res.locals.redirectUrl = `/your-completed-reports`

// REVIEWER
// return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/review`)
// res.locals.redirectUrl = `/all-completed-reports`
