import url from 'url'
import { Request, Response } from 'express'
import validateForm from './incidentStatementValidation'
import { FormError } from '../../@types/template'

export default class IncidentStatementRoutes {
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

    return res.redirect(
      url.format({
        pathname: '/incident-statement',
      })
    )
  }
}
