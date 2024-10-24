/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import validateForm from './validation'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  error?: FormError
  hasRehabilitativeActivitiesDetails?: string
}

export default class HasRehabilitativeActivitiesDetailsPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, hasRehabilitativeActivitiesDetails } = pageData

    return res.render(`pages/hasRehabilitativeActivitiesDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      hasRehabilitativeActivitiesDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId } = req.params

    const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)

    let hasRehabilitativeActivitiesDetails = null

    if (sessionData?.hasRehabilitativeActivitiesDetails === true) {
      hasRehabilitativeActivitiesDetails = 'YES'
    } else if (sessionData?.hasRehabilitativeActivitiesDetails === false) {
      hasRehabilitativeActivitiesDetails = 'NO'
    }

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, { hasRehabilitativeActivitiesDetails })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { numberOfActivities } = req.query
    const { chargeNumber, redisId } = req.params
    const { hasRehabilitativeActivitiesDetails } = req.body

    const error = validateForm({ hasDetails: hasRehabilitativeActivitiesDetails })

    if (error)
      return this.renderView(req, res, {
        error,
      })

    if (hasRehabilitativeActivitiesDetails === 'YES') {
      await this.punishmentsService.removeAnyRehabilitativeActivities(req, chargeNumber, redisId)
      const redirectUrl = adjudicationUrls.rehabilitativeActivityDetails.urls.start(chargeNumber, redisId)
      const currentActivityNumber = '1'
      return res.redirect(
        url.format({
          pathname: redirectUrl,
          query: { numberOfActivities, currentActivityNumber } as ParsedUrlQuery,
        })
      )
    }

    await this.punishmentsService.addEmptyRehabilitativeActivities(
      req,
      chargeNumber,
      redisId,
      Number(numberOfActivities)
    )
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
