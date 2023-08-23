/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { FormError } from '../../../@types/template'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import { PunishmentReasonForChange } from '../../../data/PunishmentResult'
import validateForm from './reasonForChangeValidation'

type PageData = {
  error?: FormError
  reasonForChange?: PunishmentReasonForChange
  detailsOfChange?: string
}

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class ReasonForChangePunishmentRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { chargeNumber } = req.params

    const isEdit = this.pageOptions.isEdit()

    let previouslyEnteredReasonAndDetails = null
    if (isEdit) {
      previouslyEnteredReasonAndDetails = await this.punishmentsService.getReasonForChangePunishments(req, chargeNumber)
    }

    res.render(`pages/reasonForChangePunishment.njk`, {
      errors: error ? [error] : [],
      reasonForChange: isEdit ? previouslyEnteredReasonAndDetails.reasonForChange : pageData.reasonForChange,
      detailsOfChange: isEdit ? previouslyEnteredReasonAndDetails.detailsOfChange : pageData.detailsOfChange,
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { reasonForChange, detailsOfChange } = req.body

    const error = validateForm({ reasonForChange, detailsOfChange })

    if (error) {
      return this.renderView(req, res, { error, reasonForChange, detailsOfChange })
    }

    this.punishmentsService.setReasonForChangePunishments(req, { reasonForChange, detailsOfChange }, chargeNumber)

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.checkPunishments.urls.submittedEdit(chargeNumber),
        query: { punishmentsChanged: true },
      })
    )
  }
}
