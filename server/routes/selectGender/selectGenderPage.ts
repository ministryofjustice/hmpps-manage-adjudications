/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import { FormError } from '../../@types/template'
import { User } from '../../data/hmppsAuthClient'
import { isPrisonerGenderKnown } from '../../services/prisonerSearchService'

type PageData = {
  error?: FormError
  genderSelected?: string
  draftId?: number | null
  readApiGender?: string
}

export enum PageRequestType {
  ORIGINAL,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class SelectGenderPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly placeOnReportService: PlaceOnReportService) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (res: Response, pageData: PageData): Promise<void> => {
    const { error, draftId, readApiGender } = pageData

    res.render(`pages/selectGender`, {
      errors: error ? [error] : [],
      genderSelected: readApiGender,
      cancelButtonHref: getCancelHref(this.pageOptions, draftId),
      hintText:
        'This is the gender the prisoner identifies as. We’re asking this because there’s no gender specified on this prisoner’s profile.',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId) || null
    const { prisonerNumber } = req.params
    const { user } = res.locals

    // if the prisoner already has a gender assigned on their profile, the user should not be able to access this page
    const prisonerGenderOnProfile = isPrisonerGenderKnown(await this.getPrisonerProfileGender(prisonerNumber, user))
    if (prisonerGenderOnProfile) return res.redirect(adjudicationUrls.homepage.root)

    let readApiGender: string = null
    if (this.pageOptions.isEdit()) {
      readApiGender = await this.getPreviouslySelectedGenderFromApi(draftId, user)
    }

    return this.renderView(res, { draftId, readApiGender })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = Number(req.params.draftId) || null
    const { prisonerNumber } = req.params
    const { genderSelected } = req.body

    const error = validateForm({ genderSelected })
    if (error) return this.renderView(res, { error, genderSelected })

    if (this.pageOptions.isEdit()) {
      await this.placeOnReportService.amendPrisonerGender(draftId, genderSelected, user)
      return res.redirect(adjudicationUrls.checkYourAnswers.urls.start(draftId))
    }

    // Set the chosen gender onto the session so it can be sent with the incident details on the next page
    this.placeOnReportService.setPrisonerGenderOnSession(req, prisonerNumber, genderSelected)
    return res.redirect(adjudicationUrls.incidentDetails.urls.start(prisonerNumber))
  }

  getPreviouslySelectedGenderFromApi = async (draftId: number, user: User): Promise<string> => {
    const draftAdjudication = await this.placeOnReportService.getDraftAdjudicationDetails(draftId, user)
    return draftAdjudication.draftAdjudication.gender
  }

  getPrisonerProfileGender = async (prisonerNumber: string, user: User): Promise<string> => {
    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    return prisoner.physicalAttributes.gender?.toUpperCase() || null
  }
}

type SelectGenderFormForm = {
  genderSelected: string
}

const errors: { [key: string]: FormError } = {
  RADIO_OPTION_MISSING: {
    href: '#genderSelected',
    text: 'Select the prisoner’s gender',
  },
}

const validateForm = ({ genderSelected }: SelectGenderFormForm): FormError | null => {
  if (!genderSelected) return errors.RADIO_OPTION_MISSING
  return null
}

const getCancelHref = (pageOptions: PageOptions, draftId: number) => {
  if (pageOptions.isEdit()) return adjudicationUrls.checkYourAnswers.urls.start(draftId)
  return adjudicationUrls.homepage.root
}
