/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService, { UserWithEmail } from '../../../services/userService'
import { HearingOutcomeCode, HearingOutcomeDetails } from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingOutcomeValidation'
import { User } from '../../../data/hmppsManageUsersClient'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  hearingOutcome?: HearingOutcomeCode
  inAdName?: string
  readApiHearingOutcome?: HearingOutcomeDetails
  adjudicatorType: OicHearingType
  governorId?: string
  governorName?: string
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class EnterHearingOutcomePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly hearingsService: HearingsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private getRedirectUrl = (outcome: HearingOutcomeCode, chargeNumber: string) => {
    if (this.pageOptions.isEdit()) {
      switch (outcome) {
        case HearingOutcomeCode.ADJOURN:
          return adjudicationUrls.hearingAdjourned.urls.edit(chargeNumber)
        case HearingOutcomeCode.COMPLETE:
          return adjudicationUrls.hearingPleaAndFinding.urls.edit(chargeNumber)
        default:
          return adjudicationUrls.hearingReasonForReferral.urls.edit(chargeNumber)
      }
    }
    switch (outcome) {
      case HearingOutcomeCode.ADJOURN:
        return adjudicationUrls.hearingAdjourned.urls.start(chargeNumber)
      case HearingOutcomeCode.COMPLETE:
        return adjudicationUrls.hearingPleaAndFinding.urls.start(chargeNumber)
      default:
        return adjudicationUrls.hearingReasonForReferral.urls.start(chargeNumber)
    }
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, hearingOutcome, inAdName, governorId, governorName, adjudicatorType } = pageData
    const { chargeNumber } = req.params

    return res.render(`pages/hearingOutcome/enterHearingOutcome.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      hearingOutcome,
      inAdName,
      governorId,
      governorName,
      adjudicatorType,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const { chargeNumber } = req.params
    const selectedPerson = req.query.selectedPerson as string

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    const adjudicatorType = await this.hearingsService.getHearingAdjudicatorType(chargeNumber, user)

    let readApiHearingOutcome: HearingOutcomeDetails = null
    let readApiHearingGovernor: UserWithEmail = null
    if (this.pageOptions.isEdit()) {
      readApiHearingOutcome = await this.getPreviouslyEnteredHearingOutcomeFromApi(chargeNumber, user)
      if (adjudicatorType.includes('GOV') && !selectedPerson) {
        readApiHearingGovernor = await this.userService.getStaffFromUsername(readApiHearingOutcome?.adjudicator, user)
      }
    }
    const isGovernor = adjudicatorType.includes('GOV')

    if (selectedPerson) {
      // We are coming back from search
      const governor = await this.userService.getStaffFromUsername(selectedPerson, user)
      return this.renderView(req, res, {
        governorId: selectedPerson,
        adjudicatorType,
        governorName: governor?.name,
        hearingOutcome: readApiHearingOutcome?.code,
      })
    }

    return this.renderView(req, res, {
      adjudicatorType,
      hearingOutcome: readApiHearingOutcome?.code,
      inAdName: (!isGovernor && readApiHearingOutcome?.adjudicator) || null,
      governorName: readApiHearingGovernor?.name || null,
      governorId: (isGovernor && readApiHearingOutcome?.adjudicator) || null,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { hearingOutcome, inAdName, adjudicatorType, governorId, governorName } = req.body

    if (req.body.searchGov) {
      return this.search(req, res)
    }

    if (req.body.deleteUser) {
      if (req.query.selectedPerson) return res.redirect(`${adjudicationUrls.enterHearingOutcome.root}${req.path}`)
      return this.renderView(req, res, {
        adjudicatorType,
        hearingOutcome,
      })
    }

    const error = validateForm({ hearingOutcome, inAdName, governorId, adjudicatorType })
    if (error)
      return this.renderView(req, res, {
        error,
        hearingOutcome,
        inAdName,
        adjudicatorType,
        governorId,
        governorName,
      })

    const redirectUrlPrefix = this.getRedirectUrl(
      HearingOutcomeCode[hearingOutcome as keyof typeof HearingOutcomeCode],
      chargeNumber
    )
    const adjudicator = governorId || inAdName
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { adjudicator, hearingOutcome },
      })
    )
  }

  getPreviouslyEnteredHearingOutcomeFromApi = async (
    chargeNumber: string,
    user: User
  ): Promise<HearingOutcomeDetails> => {
    return this.hearingsService.getHearingOutcome(chargeNumber, user)
  }

  validateSearch = (govName: string) => {
    if (!govName) {
      return {
        href: '#governorName',
        text: 'Enter the name of the adjudicator',
      }
    }
    return null
  }

  search = async (req: Request, res: Response): Promise<void> => {
    const { hearingOutcome, inAdName, adjudicatorType, governorId, governorName } = req.body

    const error = this.validateSearch(governorName)
    if (error) {
      return this.renderView(req, res, {
        error,
        hearingOutcome,
        inAdName,
        adjudicatorType,
        governorId,
        governorName,
      })
    }
    req.session.redirectUrl = `${adjudicationUrls.enterHearingOutcome.root}${req.path}`
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.selectAssociatedStaff.root,
        query: {
          staffName: governorName,
        },
      })
    )
  }
}
