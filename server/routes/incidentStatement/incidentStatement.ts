import url from 'url'
import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerResult from '../../data/prisonerResult'

type PageData = {
  error?: FormError
  incidentStatement?: string
  incidentStatementComplete?: string
  prisonerData?: PrisonerResult
}

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    // const { prisonerNumber } = req.params
    const prisonerNumber = 'G6415GD' // fix until we can get hold of the searched PRN
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/incidentStatement`, {
      errors: error ? [error] : [],
      prisoner,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { incidentStatement, incidentStatementComplete } = req.body

    const error = validateForm({ incidentStatement, incidentStatementComplete })

    if (error) return this.renderView(req, res, { error })

    const pathname = incidentStatementComplete === 'yes' ? '/check-your-answers' : '/place-a-prisoner-on-report'

    return res.redirect(
      url.format({
        pathname,
      })
    )
  }
}
