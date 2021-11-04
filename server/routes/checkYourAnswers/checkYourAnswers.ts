import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'

type PageData = {
  error?: FormError | FormError[]
}

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { prisonerNumber } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
      prisoner,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    try {
      return res.redirect(`/place-a-prisoner-on-report`)
    } catch (postError) {
      res.locals.redirectUrl = `/place-a-prisoner-on-report`
      throw postError
    }
  }
}
