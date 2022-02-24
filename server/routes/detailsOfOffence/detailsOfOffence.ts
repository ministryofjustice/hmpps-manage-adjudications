import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { IncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'
import { getPlaceholderValues, PlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import { User } from '../../data/hmppsAuthClient'
import UserService from '../../services/userService'

type PageData = Array<OffenceData>

export default class DetailsOfOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly allOffencesSessionService: AllOffencesSessionService
  ) {}

  private decisions = decisionTree

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const incidentRole = incidentRoleFromCode(draftAdjudication.incidentRole.roleCode)
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getOffencePrisonerDetails(
      adjudicationNumber,
      user
    )

    const offences = await Promise.all(
      pageData.map(async offenceData => {
        const answerData = await this.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.questionsAndAnswers(offenceCode, placeHolderValues, incidentRole)
        return {
          questionsAndAnswers,
          incidentRule: draftAdjudication.incidentRole.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, user),
        }
      })
    )

    return res.render(`pages/detailsOfOffence`, {
      prisoner,
      offences,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const sessionOffences = await this.populateSessionIfEmpty(adjudicationNumber, req, res)
    return this.renderView(req, res, sessionOffences)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals

    const offenceDetails = this.allOffencesSessionService
      .getAndDeleteAllSessionOffences(req, adjudicationNumber)
      .map(offenceData => {
        return { ...offenceData, offenceCode: Number(offenceData.offenceCode) }
      })
    await this.placeOnReportService.saveOffenceDetails(adjudicationNumber, offenceDetails, user)
    const prisonerNumber = await this.placeOnReportService.getPrisonerNumberFromDraftAdjudicationNumber(
      adjudicationNumber,
      user
    )
    return res.redirect(`/incident-statement/${prisonerNumber}/${adjudicationNumber}`)
  }

  addOffence = async (req: Request, res: Response): Promise<void> => {
    // If the session has not yet been populated from the database we need to do that.
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    await this.populateSessionIfEmpty(adjudicationNumber, req, res)
    // Get the offence to be added from the request and put it on the session
    const offenceToAdd: OffenceData = { ...req.query }
    this.allOffencesSessionService.addSessionOffence(req, offenceToAdd, adjudicationNumber)
    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }

  private async answerData(data: OffenceData, user: User) {
    const [victimOtherPerson, victimPrisoner, victimStaff] = await Promise.all([
      data.victimOtherPersonsName,
      data.victimPrisonersNumber && this.placeOnReportService.getPrisonerDetails(data.victimPrisonersNumber, user),
      data.victimStaffUsername && this.userService.getStaffFromUsername(data.victimStaffUsername, user),
    ])
    return {
      victimOtherPerson,
      victimPrisoner,
      victimStaff,
    }
  }

  private questionsAndAnswers(offenceCode: number, placeHolderValues: PlaceholderValues, incidentRole: IncidentRole) {
    const lastAnswer = this.decisions.findAnswerByCode(offenceCode)
    const questionsAndAnswers = lastAnswer.getQuestionsAndAnswersToGetHere()
    return questionsAndAnswers.map(questionAndAnswer => {
      const { question, answer } = questionAndAnswer
      return {
        question: question.getTitle().getProcessedText(placeHolderValues, incidentRole),
        answer: answer.getProcessedReplayText(placeHolderValues),
      }
    })
  }

  private async populateSessionIfEmpty(adjudicationNumber: number, req: Request, res: Response) {
    const { user } = res.locals
    const allOffencesOnSession = this.allOffencesSessionService.getAllSessionOffences(req, adjudicationNumber)
    if (allOffencesOnSession) {
      return allOffencesOnSession
    }
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const allOffenceData = draftAdjudication.offenceDetails.map(offenceDetails => {
      return {
        ...offenceDetails,
        offenceCode: `${offenceDetails.offenceCode}`,
      }
    })
    this.allOffencesSessionService.setAllSessionOffences(req, allOffenceData, adjudicationNumber)
    return allOffenceData
  }
}
