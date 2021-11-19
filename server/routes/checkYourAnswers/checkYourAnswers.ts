import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

type PageData = {
  error?: FormError | FormError[]
}

export default class checkYourAnswersRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { prisonerNumber, id } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )

    const IdNumberValue: number = parseInt(id as string, 10)
    const data = await this.placeOnReportService.getCheckYourAnswersInfo(IdNumberValue, incidentLocations, user)

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
      data,
      IdNumberValue,
      exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${id}`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { id, prisonerNumber } = req.params
    const IdNumberValue: number = parseInt(id as string, 10)
    try {
      const completeAdjudicationNumber = await this.placeOnReportService.completeDraftAdjudication(IdNumberValue, user)
      return res.redirect(`/prisoner-placed-on-report/${completeAdjudicationNumber}`)
    } catch (postError) {
      res.locals.redirectUrl = `/place-the-prisoner-on-report/${prisonerNumber}/${id}`
      throw postError
    }
  }
}
