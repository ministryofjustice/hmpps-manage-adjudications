import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'

type PageData = {
  error?: FormError | FormError[]
}

export default class checkYourAnswersRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

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

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      data,
      adjudicationNumber,
      offences,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/edit`,
      editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}`,
      statementEditable: true,
      creationJourney: true,
      submitButtonText: 'Accept and place on report',
      secondaryButtonText: 'Exit',
      exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`,
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
      return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}`)
    } catch (postError) {
      res.locals.redirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationNumber}`
      throw postError
    }
  }
}
