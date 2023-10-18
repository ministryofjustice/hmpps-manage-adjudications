/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { DecisionForm } from './decisionForm'
import Question from '../../offenceCodeDecisions/Question'
import { OffenceRuleWithCode } from '../../data/DraftAdjudicationResult'

type PageData = {
  errors?: FormError[]
  draftId: number
  incidentRole: string
  allOffenceRules: OffenceRuleWithCode[]
} & DecisionForm

export default class OffenceListRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const { incidentRole } = req.params
    const { user } = res.locals

    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)
    const allOffenceRules = await this.placeOnReportService.getAllOffenceRules(
      draftAdjudication.isYouthOffender,
      draftAdjudication.gender,
      user
    )

    return this.renderView(req, res, { draftId, incidentRole, allOffenceRules })
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { errors, allOffenceRules } = pageData

    return res.render(`pages/offenceList.njk`, {
      errors: errors || [],
      decisionForm: pageData,
      allOffenceRules,
      pageData,
    })
  }

  private decisions(): Question {
    return this.decisionTreeService.getDecisionTree()
  }
}
