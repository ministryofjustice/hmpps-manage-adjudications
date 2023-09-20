import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { PageRequestType } from './offenceCodeDecisionsPage'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import OffenceListRoutes from './offenceListPage'

export default class OffenceListRoute {
  page: OffenceListRoutes

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
    this.page = new OffenceListRoutes(
      PageRequestType.REPORTER,
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
}
