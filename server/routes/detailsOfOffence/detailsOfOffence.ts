import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import DecisionTreeService from '../../services/decisionTreeService'
import DetailsOfOffenceHelper from './detailsOfOffenceHelper'
import adjudicationUrls from '../../utils/urlGenerator'

export default class DetailsOfOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helper = new DetailsOfOffenceHelper(this.placeOnReportService, this.allOffencesSessionService)

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(adjudicationNumber, user)
    const allOffences = await this.helper.populateSessionIfEmpty(adjudicationNumber, req, res)
    const offences = await Promise.all(
      allOffences.map(async offenceData => {
        const answerData = await this.decisionTreeService.answerDataDetails(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { draftAdjudication, incidentRole } = await this.decisionTreeService.draftAdjudicationIncidentData(
      adjudicationNumber,
      user
    )
    const { addOffence } = req.body
    if (addOffence) {
      return res.redirect(adjudicationUrls.offenceCodeSelection.urls.start(adjudicationNumber, incidentRole))
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
    if (draftAdjudication.adjudicationNumber) {
      return res.redirect(adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
