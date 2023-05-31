import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import OffenceCodeDecisionsPage, { PageRequestType } from './offenceCodeDecisionsPage'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default class offenceCodeDecisionsAloEditRoutes {
  page: OffenceCodeDecisionsPage

  constructor({
    placeOnReportService,
    userService,
    decisionTreeService,
    prisonerSearchService,
  }: {
    placeOnReportService: PlaceOnReportService
    userService: UserService
    decisionTreeService: DecisionTreeService
    prisonerSearchService: PrisonerSearchService
  }) {
    this.page = new OffenceCodeDecisionsPage(
      PageRequestType.EDIT_ALO,
      placeOnReportService,
      userService,
      decisionTreeService,
      prisonerSearchService
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }

  redirectToStart = async (req: Request, res: Response): Promise<void> => {
    await this.page.redirectToStart(req, res)
  }
}
