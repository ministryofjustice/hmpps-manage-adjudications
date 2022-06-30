import { Request, Response } from 'express'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_SELECTION = 'MISSING_SELECTION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#confirmDelete',
    text: 'Select yes if you want to delete this offence',
  },
}

export default class DeleteOffenceRoutes {
  constructor(
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, [])

  private async renderView(req: Request, res: Response, errors: FormError[]) {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole, prisoner, associatedPrisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(
      adjudicationNumber,
      user
    )
    const offenceIndex = Number(req.params.offenceIndex)
    // We assume the offences are already set up on the session
    const offenceData = this.allOffencesSessionService.getSessionOffence(req, offenceIndex, adjudicationNumber)
    const answerData = await this.decisionTreeService.answerDataDetails(offenceData, user)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
      Number(offenceData.offenceCode),
      placeHolderValues,
      incidentRole
    )
    return res.render(`pages/deleteOffence`, { offenceIndex, questionsAndAnswers, errors })
  }

  submit = async (req: Request, res: Response) => {
    const { confirmDelete } = req.body
    const offenceIndex = Number(req.params.offenceIndex)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    if (!confirmDelete) {
      return this.renderView(req, res, [error.MISSING_SELECTION])
    }
    if (confirmDelete === 'yes') {
      this.allOffencesSessionService.deleteSessionOffence(req, offenceIndex, adjudicationNumber)
    }
    return res.redirect(adjudicationUrls.detailsOfOffence.urls.modified(adjudicationNumber))
  }
}
