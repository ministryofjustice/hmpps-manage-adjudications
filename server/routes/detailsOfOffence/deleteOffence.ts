import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import DetailsOfOffenceHelper from './detailsOfOffenceHelper'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'

export default class DeleteOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private helper = new DetailsOfOffenceHelper(
    this.placeOnReportService,
    this.userService,
    this.allOffencesSessionService,
    this.decisionTreeService
  )

  view = async (req: Request, res: Response) => {
    const { user } = res.locals
    const { adjudicationNumber, incidentRole, prisoner, associatedPrisoner } = await this.helper.adjudicationData(
      Number(req.params.adjudicationNumber),
      user
    )
    const index = Number(req.params.offenceIndex)
    const offenceData = this.allOffencesSessionService.getSessionOffence(req, index, adjudicationNumber)
    const answerData = await this.helper.answerData(offenceData, user)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.helper.questionsAndAnswers(
      Number(offenceData.offenceCode),
      placeHolderValues,
      incidentRole
    )
    return res.render(`pages/deleteOffence`, { questionsAndAnswers })
  }
}
