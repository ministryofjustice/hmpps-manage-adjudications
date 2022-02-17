import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import { addSessionOffence, getSessionOffences } from './detailsOfOffenceSessionHelper'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole, incidentRoleFromCode, incidentRule } from '../../incidentRole/IncidentRole'
import { getPlaceholderValues, PlaceholderValues } from '../../offenceCodeDecisions/Placeholder'

type PageData = Array<OffenceData>

export default class DetailsOfOffenceRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private decisions = decisionTree

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { user } = res.locals
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(
      Number(adjudicationNumber),
      user
    )
    const incidentRole = incidentRoleFromCode(draftAdjudication.draftAdjudication.incidentRole.roleCode)
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getPrisonerDetailsForAdjudication(
      Number(adjudicationNumber),
      user
    )
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner)

    const offences = await Promise.all(
      pageData.map(async offenceData => {
        const questionsAndAnswers = this.questionsAndAnswers(offenceData, placeHolderValues, incidentRole)
        return {
          questionsAndAnswers,
          incidentRule: incidentRule(incidentRole),
          offenceRule: await this.placeOnReportService.getOffenceRule(Number(offenceData.offenceCode), user),
        }
      })
    )

    return res.render(`pages/detailsOfOffence`, {
      prisoner,
      offences,
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
    const offenceToAdd: OffenceData = { ...req.query }
    addSessionOffence(req, offenceToAdd, adjudicationNumber)

    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }

  private questionsAndAnswers(data: OffenceData, placeHolderValues: PlaceholderValues, incidentRole: IncidentRole) {
    const questionsAndAnswers = this.decisions.findByCode(data.offenceCode).getQuestionsAndAnswersToGetHere()
    return questionsAndAnswers.map(questionAndAnswer => {
      const { question, answer } = questionAndAnswer
      return {
        question: question.getProcessedText(placeHolderValues, incidentRole),
        answer: answer.getProcessedText(placeHolderValues),
      }
    })
  }

  private populateSessionIfEmpty(adjudicationNumber: string): Array<OffenceData> {
    return []
  }
}
