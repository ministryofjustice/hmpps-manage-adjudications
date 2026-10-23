import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import validateForm, { validateBatchForm } from './validation'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentData, convertPunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  hasRehabilitativeActivitiesDetails?: string
  numberOfActivities?: string
}

const punishmentName = (punishment: PunishmentData) =>
  convertPunishmentType(
    punishment.type,
    punishment.stoppagePercentage,
    punishment.privilegeType,
    punishment.otherPrivilege,
  )

// "Loss of TV" → "loss of TV", for use mid-sentence
const lowerFirst = (text: string) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text)

export default class HasRehabilitativeActivitiesDetailsPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  // With the toggle on (IR-1904) the number of activities is asked here, and the journey moves through
  // the punishments ticked on "Which punishments have a rehabilitative activity condition?"
  private isBatchJourney = (res: Response) => !!res.locals.featureToggles?.multiPrivilegePunishments

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { error, hasRehabilitativeActivitiesDetails, numberOfActivities } = pageData

    let title = 'Do you have the details of the rehabilitative activity?'
    let appliesTo: string[] = []
    let rehabBatchId: string = null
    if (this.isBatchJourney(res)) {
      const batch = this.punishmentsService.getRehabBatch(req, chargeNumber)
      rehabBatchId = batch?.id ?? ''
      if (batch?.sameForAll && batch.redisIds.length > 1) {
        title = 'Do you have the details of the rehabilitative activities?'
        appliesTo = batch.redisIds
          .map(id => this.punishmentsService.getSessionPunishment(req, chargeNumber, id))
          .filter(Boolean)
          .map(punishmentName)
      } else {
        const punishment = this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)
        title = `Do you have the details of the rehabilitative activities for ${lowerFirst(punishmentName(punishment))}?`
      }
    }

    return res.render(`pages/hasRehabilitativeActivitiesDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      hasRehabilitativeActivitiesDetails,
      numberOfActivities,
      askNumberOfActivities: this.isBatchJourney(res),
      title,
      appliesTo,
      rehabBatchId,
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

    if (this.isBatchJourney(res) && !sessionData) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }

    const numberOfActivities =
      hasRehabilitativeActivitiesDetails === 'YES' && sessionData.rehabilitativeActivities?.length
        ? String(sessionData.rehabilitativeActivities.length)
        : null
    return this.renderView(req, res, { hasRehabilitativeActivitiesDetails, numberOfActivities })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    if (this.isBatchJourney(res)) return this.submitBatch(req, res)

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
        }),
      )
    }

    await this.punishmentsService.addEmptyRehabilitativeActivities(
      req,
      chargeNumber,
      redisId,
      Number(numberOfActivities),
    )
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }

  private submitBatch = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { hasRehabilitativeActivitiesDetails } = req.body
    const numberOfActivities = String(req.body.numberOfActivities ?? '').trim()

    if (!this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    if (!this.punishmentsService.isCurrentRehabBatchForm(req, chargeNumber, redisId, req.body.rehabBatchId)) {
      return res.redirect(this.punishmentsService.nextRehabBatchUrl(req, chargeNumber))
    }

    const error = validateBatchForm({ hasDetails: hasRehabilitativeActivitiesDetails, numberOfActivities })
    if (error) return this.renderView(req, res, { error, hasRehabilitativeActivitiesDetails, numberOfActivities })

    if (hasRehabilitativeActivitiesDetails === 'YES') {
      // the punishment keeps any activities it has until all the new ones are entered
      this.punishmentsService.startRehabDraft(req, chargeNumber, redisId)
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.rehabilitativeActivityDetails.urls.start(chargeNumber, redisId),
          query: { numberOfActivities, currentActivityNumber: '1' } as ParsedUrlQuery,
        }),
      )
    }

    // No details yet: one "Not entered" activity, which can be completed from the report later
    await this.punishmentsService.addEmptyRehabilitativeActivities(req, chargeNumber, redisId, 1)
    this.punishmentsService.completeRehabBatchItem(req, chargeNumber, redisId)
    return res.redirect(this.punishmentsService.nextRehabBatchUrl(req, chargeNumber))
  }
}
