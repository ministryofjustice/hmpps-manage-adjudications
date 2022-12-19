import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class AddOffenceRoutes {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly allOffencesSessionService: AllOffencesSessionService
  ) {}

  add = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    // Get the offence to be added from the request and put it on the session
    const offenceToAdd: OffenceData = { ...req.query }
    // We assume the offences are already set up on the session
    // We delete any existing offences on the session before saving the new one
    this.allOffencesSessionService.deleteAllSessionOffences(req, adjudicationNumber)
    this.allOffencesSessionService.addSessionOffence(req, offenceToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfOffence.urls.modified(adjudicationNumber))
  }
}
