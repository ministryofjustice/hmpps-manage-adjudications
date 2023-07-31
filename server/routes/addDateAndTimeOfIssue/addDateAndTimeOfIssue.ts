import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { FormError, SubmittedDateTime } from '../../@types/template'
import validateForm from './addDateAndTimeValidation'
import adjudicationUrls from '../../utils/urlGenerator'
import { convertSubmittedDateTimeToDateObject, formatDate } from '../../utils/utils'
import logger from '../../../logger'

export default class AddDateAndTimeOfIssueRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (res: Response, issuedDate: SubmittedDateTime, error: FormError): Promise<void> => {
    return res.render(`pages/addDateAndTimeOfIssue`, {
      issuedDate: convertSubmittedDateTimeToDateObject(issuedDate),
      cancelHref: adjudicationUrls.confirmDISFormsIssued.urls.start(),
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(res, null, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { issuedDate } = req.body
    const validationErrors = validateForm(issuedDate)
    if (validationErrors) {
      return this.renderView(res, issuedDate, validationErrors)
    }

    try {
      await this.reportedAdjudicationsService.issueDISForm(chargeNumber, formatDate(issuedDate), user)
    } catch (postError) {
      logger.error(`Failed to post issue date time for adjudication ${chargeNumber}: ${postError}`)
      res.locals.redirectUrl = adjudicationUrls.addIssueDateTime.urls.start(chargeNumber)
    }
    return res.redirect(adjudicationUrls.confirmDISFormsIssued.urls.start())
  }
}
