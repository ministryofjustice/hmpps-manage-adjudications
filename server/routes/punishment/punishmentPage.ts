/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './punishmentValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'
import PunishmentsService from '../../services/punishmentsService'

type PageData = {
  error?: FormError
  punishmentType?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
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

export default class PunishmentPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = pageData

    return res.render(`pages/punishment.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      punishmentType,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
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
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = req.body

    const error = validateForm({ punishmentType, privilegeType, otherPrivilege, stoppagePercentage })

    if (error)
      return this.renderView(req, res, { error, punishmentType, privilegeType, otherPrivilege, stoppagePercentage })

    return null
  }
}
