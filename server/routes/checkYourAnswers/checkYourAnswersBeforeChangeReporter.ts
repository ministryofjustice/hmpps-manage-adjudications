import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'

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

    const offences = await Promise.all(
      allOffenceData.map(async offenceData => {
        const answerData = await this.decisionTreeService.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = await this.decisionTreeService.questionsAndAnswers(
          offenceCode,
          placeHolderValues,
          incidentRole
        )
        return {
          questionsAndAnswers,
          incidentRule: draftAdjudication.incidentRole.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, user),
        }
      })
    )

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      data,
      offences,
      adjudicationNumber,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit?referrer=/check-your-answers/${prisoner.prisonerNumber}/${adjudicationNumber}/report`,
      editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${adjudicationNumber}/submitted/edit`,
      statementEditable: true,
      creationJourney: false,
      submitButtonText: 'Confirm changes',
      secondaryButtonText: 'Cancel',
      exitUrl: `/prisoner-report/${prisonerNumber}/${adjudicationNumber}/report`,
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
      return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}/changes-confirmed/report`)
    } catch (postError) {
      res.locals.redirectUrl = `/your-completed-reports`
      throw postError
    }
  }
}
