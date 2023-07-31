/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './ageOfPrisonerValidation'
import { FormError } from '../../@types/template'
import logger from '../../../logger'
import { calculateAge } from '../../utils/utils'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'

type PageData = {
  error?: FormError
  whichRuleChosen?: string
  aloEdit?: boolean
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

const getRedirectUrls = (pageOptions: PageOptions, draftId: number, isAloEdit: boolean) => {
  if (pageOptions.isPreviouslySubmitted()) {
    if (isAloEdit) return adjudicationUrls.incidentRole.urls.aloSubmittedEdit(draftId)
    return adjudicationUrls.incidentRole.urls.submittedEdit(draftId)
  }
  return adjudicationUrls.incidentRole.urls.start(draftId)
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

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (res: Response, draftId: number, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { user } = res.locals
    const aloEditingOffence = pageData.aloEdit as unknown as boolean

    const [prisoner, adjudicationDetails] = await Promise.all([
      this.placeOnReportService.getPrisonerDetailsFromAdjNumber(draftId, user),
      this.placeOnReportService.getDraftAdjudicationDetails(draftId, user),
    ])

    const ageOfPrisoner =
      calculateAge(prisoner.dateOfBirth, adjudicationDetails.draftAdjudication.incidentDetails.dateTimeOfIncident) ||
      null

    const cancelHref = aloEditingOffence
      ? adjudicationUrls.prisonerReport.urls.review(adjudicationDetails.draftAdjudication.chargeNumber)
      : adjudicationUrls.taskList.urls.start(adjudicationDetails.draftAdjudication.id)

    return res.render(`pages/ageOfPrisoner`, {
      errors: error ? [error] : [],
      ageOfPrisoner,
      whichRuleChosen: getPreviouslyChosenRule(adjudicationDetails.draftAdjudication),
      cancelButtonHref: cancelHref,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    if (req.query.reselectingFirstOffence) {
      req.session.forceOffenceSelection = true
    } else {
      delete req.session.forceOffenceSelection
    }
    return this.renderView(res, draftId, {
      aloEdit: req.query.aloEdit as unknown as boolean,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { whichRuleChosen, originalRuleSelection } = req.body
    const draftId = Number(req.params.draftId)
    const aloEdit = req.query.aloEdit as unknown as boolean

    const error = validateForm({ whichRuleChosen })
    if (error) return this.renderView(res, draftId, { error, whichRuleChosen, aloEdit })

    const applicableRuleChanged = originalRuleSelection !== whichRuleChosen

    try {
      await this.placeOnReportService.addDraftYouthOffenderStatus(draftId, whichRuleChosen, applicableRuleChanged, user)
      const redirectUrl = getRedirectUrls(this.pageOptions, draftId, aloEdit as boolean)
      return res.redirect(redirectUrl)
    } catch (postError) {
      logger.error(`Failed to post prison rule for draft adjudication: ${postError}`)
      res.locals.redirectUrl = adjudicationUrls.ageOfPrisoner.urls.start(draftId)
      if (req.query.reselectingFirstOffence) {
        res.locals.redirectUrl = adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(draftId)
      }
      throw postError
    }
  }
}
