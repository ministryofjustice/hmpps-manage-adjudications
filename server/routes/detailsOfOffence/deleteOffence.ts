import { Request, Response } from 'express'
import url from 'url'
import DecisionTreeService from '../../services/decisionTreeService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'
import { OffenceData } from '../offenceCodeDecisions/offenceData'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_SELECTION = 'MISSING_SELECTION',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#confirmDelete',
    text: 'Select yes if you want to remove this offence',
  },
}

export default class DeleteOffenceRoutes {
  constructor(private readonly decisionTreeService: DecisionTreeService) {}

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, [])

  private async renderView(req: Request, res: Response, errors: FormError[]) {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { incidentRole, prisoner, associatedPrisoner } = await this.decisionTreeService.draftAdjudicationIncidentData(
      adjudicationNumber,
      user
    )

    const offenceData: OffenceData = { ...req.query }
    const answerData = await this.decisionTreeService.answerDataDetails(offenceData, user)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
      Number(offenceData.offenceCode),
      placeHolderValues,
      incidentRole,
      false
    )

    return res.render(`pages/deleteOffence`, {
      questionsAndAnswers,
      errors,
      offenceData,
    })
  }

  submit = async (req: Request, res: Response) => {
    const { confirmDelete } = req.body
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    if (!confirmDelete) {
      return this.renderView(req, res, [error.MISSING_SELECTION])
    }
    if (confirmDelete === 'yes') {
      return res.redirect(adjudicationUrls.detailsOfOffence.urls.modified(adjudicationNumber))
    }
    const offenceData: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.modified(adjudicationNumber),
        query: offenceData,
      },
      res
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
