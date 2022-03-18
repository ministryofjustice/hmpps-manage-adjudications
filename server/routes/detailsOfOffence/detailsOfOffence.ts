import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import DecisionTreeService from '../../services/decisionTreeService'
import DetailsOfOffenceHelper from './detailsOfOffenceHelper'

export default class DetailsOfOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helper = new DetailsOfOffenceHelper(
    this.placeOnReportService,
    this.allOffencesSessionService,
    this.decisionTreeService
  )

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { adjudicationNumber, draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.adjudicationData(Number(req.params.adjudicationNumber), user)
    const allOffences = await this.helper.populateSessionIfEmpty(adjudicationNumber, req, res)
    const offences = await Promise.all(
      allOffences.map(async offenceData => {
        const answerData = await this.decisionTreeService.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = await this.decisionTreeService.questionsAndAnswers(
          offenceCode,
          placeHolderValues,
          incidentRole
        )
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
      adjudicationNumber,
      incidentRole,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { adjudicationNumber, incidentRole } = await this.decisionTreeService.adjudicationData(
      Number(req.params.adjudicationNumber),
      user
    )
    const { addOffence } = req.body
    if (addOffence) {
      return res.redirect(`/offence-code-selection/${adjudicationNumber}/${incidentRole}`)
    }
    const offenceDetails = this.allOffencesSessionService
      .getAndDeleteAllSessionOffences(req, adjudicationNumber)
      .map(offenceData => {
        return {
          victimOtherPersonsName: offenceData.victimOtherPersonsName,
          victimPrisonersNumber: offenceData.victimPrisonersNumber,
          victimStaffUsername: offenceData.victimStaffUsername,
          offenceCode: Number(offenceData.offenceCode),
        }
      })
    await this.placeOnReportService.saveOffenceDetails(adjudicationNumber, offenceDetails, user)
    const prisonerNumber = await this.placeOnReportService.getPrisonerNumberFromDraftAdjudicationNumber(
      adjudicationNumber,
      user
    )
    return res.redirect(`/incident-statement/${prisonerNumber}/${adjudicationNumber}`)
  }
}
