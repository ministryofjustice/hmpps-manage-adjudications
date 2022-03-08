import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import { IncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'
import { getPlaceholderValues, PlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import { User } from '../../data/hmppsAuthClient'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import { Decision } from '../../offenceCodeDecisions/Decision'

export default class DeleteOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const index = Number(req.params.index)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.render(`pages/deleteOffence`, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }

  private decisions(): Decision {
    return this.decisionTreeService.getDecisionTree()
  }
}
