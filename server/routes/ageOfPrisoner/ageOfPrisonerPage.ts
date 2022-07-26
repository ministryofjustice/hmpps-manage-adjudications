/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './ageOfPrisonerValidation'
import { FormError } from '../../@types/template'
import logger from '../../../logger'
import { calculateAge } from '../../utils/utils'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import AllOffencesSessionService from '../../services/allOffencesSessionService'

type PageData = {
  error?: FormError
  whichRuleChosen?: string
}

export enum PageRequestType {
  CREATION,
  EDIT_SUBMITTED,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isPreviouslySubmitted(): boolean {
    return this.pageType === PageRequestType.EDIT_SUBMITTED
  }
}

const getRedirectUrls = (pageOptions: PageOptions, adjudicationNumber: number) => {
  if (pageOptions.isPreviouslySubmitted()) {
    return adjudicationUrls.incidentRole.urls.submittedEdit(adjudicationNumber)
  }
  return adjudicationUrls.incidentRole.urls.start(adjudicationNumber)
}

const getPreviouslyChosenRule = (draftAdjudication: DraftAdjudication): string => {
  switch (draftAdjudication.isYouthOffender) {
    case true:
      return 'yoi'
    case false:
      return 'adult'
    default:
      return undefined
  }
}

export default class AgeOfPrisonerPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (res: Response, idValue: number, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { user } = res.locals

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
      whichRuleChosen: getPreviouslyChosenRule(adjudicationDetails.draftAdjudication),
      cancelButtonHref: adjudicationUrls.taskList.urls.start(adjudicationDetails.draftAdjudication.id),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    if (!!req.query.reselectingFirstOffence) {
      req.session.forceOffenceSelection = true
    } else {
      delete req.session.forceOffenceSelection
      // This is the entry point for the journey to change offences - remove existing offences from the session
      this.allOffencesSessionService.deleteAllSessionOffences(req, adjudicationNumber)
    }
    return this.renderView(res, adjudicationNumber, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { whichRuleChosen, originalRuleSelection } = req.body
    const idValue = Number(req.params.adjudicationNumber)

    const error = validateForm({ whichRuleChosen })
    if (error) return this.renderView(res, idValue, { error, whichRuleChosen })

    const applicableRuleChanged = originalRuleSelection !== whichRuleChosen

    try {
      await this.placeOnReportService.addDraftYouthOffenderStatus(idValue, whichRuleChosen, applicableRuleChanged, user)
      const redirectUrl = getRedirectUrls(this.pageOptions, idValue)
      return res.redirect(redirectUrl)
    } catch (postError) {
      logger.error(`Failed to post prison rule for draft adjudication: ${postError}`)
      res.locals.redirectUrl = adjudicationUrls.ageOfPrisoner.urls.start(idValue)
      if (!!req.query.reselectingFirstOffence) {
        res.locals.redirectUrl = adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(idValue)
      }
      throw postError
    }
  }
}
