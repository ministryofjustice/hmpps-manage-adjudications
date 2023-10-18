/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import { DecisionForm } from './decisionForm'
import Question from '../../offenceCodeDecisions/Question'

type OffenceRule = { paragraphNumber: string; paragraphDescription: string; offenceCode: number }
type PageData = {
  errors?: FormError[]
  draftId: number
  incidentRole: string
  questions: OffenceRule[]
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

    // get data from getAllOffenceRules
    const questions = [
      {
        paragraphNumber: '25(c)',
        paragraphDescription: 'Disobeys any lawful order',
        offenceCode: 22001,
      },
      {
        paragraphNumber: '1(a)',
        paragraphDescription: 'Commits any racially aggravated assault',
        offenceCode: 1007,
      },
    ]

    return this.renderView(req, res, { draftId, incidentRole, questions })
  }

  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { errors, questions } = pageData

    return res.render(`pages/offenceList.njk`, {
      errors: errors || [],
      decisionForm: pageData,
      questions,
      pageData,
    })
  }

  private decisions(): Question {
    return this.decisionTreeService.getDecisionTree()
  }
}
