import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import PlaceOnReportService from '../../services/placeOnReportService'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CheckCreateOnBehalfOfPage {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly createOnBehalfOfSessionService: CreateOnBehalfOfSessionService,
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const createdOnBehalfOfOfficer = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, id)
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, id)
    const checkData = [
      {
        label: 'New reporting officer',
        value: createdOnBehalfOfOfficer,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.start(id)}`,
        dataQa: 'reporting-officer-changeLink',
      },
      {
        label: 'Reason why you are reporting on their behalf',
        value: createdOnBehalfOfReason,
        changeLinkHref: `${adjudicationUrls.createOnBehalfOf.urls.reason(
          id,
        )}?createdOnBehalfOfOfficer=${createdOnBehalfOfOfficer}`,
        dataQa: 'reason-changeLink',
      },
    ]

    return res.render(`pages/checkCreateOnBehalfOf`, {
      id,
      checkData,
      cancelHref: this.createOnBehalfOfSessionService.getRedirectUrl(req, id),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { id } = req.params
    const createdOnBehalfOfOfficer = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfOfficer(req, id)
    const createdOnBehalfOfReason = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfReason(req, id)
    const editSubmittedAdjudication = this.createOnBehalfOfSessionService.getCreatedOnBehalfOfEditSubmittedAdjudication(
      req,
      id,
    )

    if (editSubmittedAdjudication === 'true') {
      await this.placeOnReportService.setCreatedOnBehalfOf(id, createdOnBehalfOfOfficer, createdOnBehalfOfReason, user)
    } else {
      await this.placeOnReportService.setDraftCreatedOnBehalfOf(
        Number(id),
        createdOnBehalfOfOfficer,
        createdOnBehalfOfReason,
        user,
      )
    }
    this.createOnBehalfOfSessionService.deleteCreatedOnBehalfOfOfficer(req, id)
    this.createOnBehalfOfSessionService.deleteCreatedOnBehalfOfReason(req, id)
    this.createOnBehalfOfSessionService.deleteCreatedOnBehalfOfEditSubmittedAdjudication(req, id)
    const redirectUrl = this.createOnBehalfOfSessionService.getRedirectUrl(req, id)
    this.createOnBehalfOfSessionService.deleteRedirectUrl(req, id)

    return res.redirect(redirectUrl)
  }
}
