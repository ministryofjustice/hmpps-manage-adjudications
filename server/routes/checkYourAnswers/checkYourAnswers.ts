import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import DetailsOfOffenceHelper from '../detailsOfOffence/detailsOfOffenceHelper'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'

type PageData = {
  error?: FormError | FormError[]
}

export default class checkYourAnswersRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helper = new DetailsOfOffenceHelper(
    this.placeOnReportService,
    this.userService,
    this.allOffencesSessionService,
    this.decisionTreeService
  )

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals

    // const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    const { adjudicationNumber, draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.helper.adjudicationData(Number(req.params.adjudicationNumber), user)
    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )
    const allOffences = await this.helper.populateSessionIfEmpty(adjudicationNumber, req, res)
    const offences = await Promise.all(
      allOffences.map(async offenceData => {
        const answerData = await this.helper.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.helper.questionsAndAnswers(offenceCode, placeHolderValues, incidentRole)
        return {
          questionsAndAnswers,
          incidentRule: draftAdjudication.incidentRole.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, user),
        }
      })
    )

    const data = await this.placeOnReportService.getCheckYourAnswersInfo(adjudicationNumber, incidentLocations, user)

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
    const { adjudicationNumber, prisonerNumber } = req.params
    const adjudicationId: number = parseInt(adjudicationNumber as string, 10)
    try {
      const completeAdjudicationNumber = await this.placeOnReportService.completeDraftAdjudication(adjudicationId, user)
      return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}`)
    } catch (postError) {
      res.locals.redirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${adjudicationId}`
      throw postError
    }
  }
}
