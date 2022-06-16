import { Request, Response } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './ageOfPrisonerValidation'
import { FormError } from '../../@types/template'
import logger from '../../../logger'
import { calculateAge } from '../../utils/utils'

type PageData = {
  error?: FormError
  whichRuleChosen?: string
}

export default class AgeOfPrisonerRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, whichRuleChosen } = pageData
    const { adjudicationNumber } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No adjudication number provided')
    }

    const [prisoner, adjudicationDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(idValue, user),
      this.placeOnReportService.getDraftAdjudicationDetails(idValue, user),
    ])

    const ageOfPrisoner =
      calculateAge(prisoner.dateOfBirth, adjudicationDetails.draftAdjudication.incidentDetails.dateTimeOfIncident) ||
      null

    return res.render(`pages/ageOfPrisoner`, {
      errors: error ? [error] : [],
      ageOfPrisoner,
      whichRuleChosen,
      cancelButtonHref: adjudicationUrls.taskList.urls.start(adjudicationDetails.draftAdjudication.id),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { whichRuleChosen } = req.body
    const { adjudicationNumber } = req.params
    const idValue: number = parseInt(adjudicationNumber as string, 10)

    const error = validateForm({ whichRuleChosen })
    if (error) return this.renderView(req, res, { error, whichRuleChosen })

    try {
      await this.placeOnReportService.addDraftYouthOffenderStatus(idValue, whichRuleChosen, user)
      return res.redirect(adjudicationUrls.incidentRole.urls.start(idValue))
    } catch (postError) {
      logger.error(`Failed to post prison rule for draft adjudication: ${postError}`)
      res.locals.redirectUrl = adjudicationUrls.ageOfPrisoner.urls.start(idValue)
      throw postError
    }
  }
}
