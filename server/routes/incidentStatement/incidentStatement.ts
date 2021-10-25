import url from 'url'
import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, error?: FormError): Promise<void> => {
    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement, incidentStatementComplete } = req.body

    const error = validateForm({ incidentStatement, incidentStatementComplete })

    if (error) return this.renderView(req, res, error)

    const pathname = incidentStatementComplete === 'yes' ? '/check-your-answers' : '/place-a-prisoner-on-report'

    return res.redirect(
      url.format({
        pathname,
      })
    )
  }
}
