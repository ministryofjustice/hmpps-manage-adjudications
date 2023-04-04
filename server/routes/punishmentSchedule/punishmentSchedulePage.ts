/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './punishmentScheduleValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
  days?: number
  suspended?: string
  suspendedUntil?: string
  startDate?: string
  endDate?: string
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

export default class PunishmentSchedulePage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly userService: UserService) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, days, suspended, suspendedUntil, startDate, endDate } = pageData

    return res.render(`pages/punishmentSchedule.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      days,
      suspended,
      suspendedUntil,
      startDate,
      endDate,
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
    const { days, suspended, suspendedUntil, startDate, endDate } = req.body

    const error = validateForm({ days, suspended, suspendedUntil, startDate, endDate })

    if (error) return this.renderView(req, res, { error, days, suspended, suspendedUntil, startDate, endDate })

    return null
  }
}
