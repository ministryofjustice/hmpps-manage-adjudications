import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { DecisionAnswers } from '../offenceCodeDecisions/decisionAnswers'
import { addSessionOffence, getSessionOffences } from './detailsOfOffenceSessionHelper'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'

type PageData = Array<DecisionAnswers>

export default class DetailsOfOffenceRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private decisions = decisionTree

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const questions = pageData.map(o => {
      return { questions: this.decisions.findByCode(o.offenceCode).questionsToGetHere() }
    })
    return res.render(`pages/detailsOfOffence`, {
      questions,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    this.populateSessionIfEmpty(adjudicationNumber)
    return this.renderView(req, res, getSessionOffences(req, adjudicationNumber))
  }

  addOffence = async (req: Request, res: Response): Promise<void> => {
    // If the session has not yet been populated from the database we need to do that.
    const { adjudicationNumber } = req.params
    this.populateSessionIfEmpty(adjudicationNumber)
    // Get the offence to be added from the request and put it on the session
    const offenceToAdd: DecisionAnswers = { ...req.query }
    addSessionOffence(req, offenceToAdd, adjudicationNumber)

    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }

  private populateSessionIfEmpty(adjudicationNumber: string): Array<DecisionAnswers> {
    return []
  }
}
