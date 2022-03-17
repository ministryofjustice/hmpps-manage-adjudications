import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import DetailsOfOffenceHelper from './detailsOfOffenceHelper'

export default class AddOffenceRoutes {
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

  add = async (req: Request, res: Response): Promise<void> => {
    // If the session has not yet been populated from the database we need to do that.
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    await this.helper.populateSessionIfEmpty(adjudicationNumber, req, res)
    // Get the offence to be added from the request and put it on the session
    const offenceToAdd: OffenceData = { ...req.query }
    this.allOffencesSessionService.addSessionOffence(req, offenceToAdd, adjudicationNumber)
    return res.redirect(`/details-of-offence/${adjudicationNumber}`)
  }
}
