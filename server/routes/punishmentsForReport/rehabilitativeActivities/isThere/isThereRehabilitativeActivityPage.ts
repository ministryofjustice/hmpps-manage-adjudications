/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import validateForm from './validation'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  error?: FormError
  isThereRehabilitativeActivities?: string
  numberOfActivities?: number
}

export default class IsThereRehabilitativeActivitiesPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, isThereRehabilitativeActivities, numberOfActivities } = pageData

    return res.render(`pages/isThereRehabilitativeActivities.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      isThereRehabilitativeActivities,
      numberOfActivities,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId } = req.params

    const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)

    let isThereRehabilitativeActivities = null
    let numberOfActivities = null

    if (sessionData?.isThereRehabilitativeActivities === true) {
      isThereRehabilitativeActivities = 'YES'
      numberOfActivities = sessionData.rehabilitativeActivities.length
    } else if (sessionData?.isThereRehabilitativeActivities === false) {
      isThereRehabilitativeActivities = 'NO'
    }

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, { isThereRehabilitativeActivities, numberOfActivities })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { isThereRehabilitativeActivities, numberOfActivities } = req.body

    const error = validateForm({ rehabChoice: isThereRehabilitativeActivities, numberOfActivities })

    if (error)
      return this.renderView(req, res, {
        error,
        isThereRehabilitativeActivities,
      })

    if (isThereRehabilitativeActivities === 'YES') {
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start(chargeNumber, redisId),
          query: {
            numberOfActivities,
          } as ParsedUrlQueryInput,
        })
      )
    }

    await this.punishmentsService.noRehabilitativeActivities(req, chargeNumber, redisId)

    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
