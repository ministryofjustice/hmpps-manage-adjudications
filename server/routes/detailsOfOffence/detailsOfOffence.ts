/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import { OffenceData } from '../offenceCodeDecisions/offenceData'

export enum PageRequestType {
  OFFENCES_FROM_API,
  OFFENCES_FROM_SESSION,
  OFFENCES_FROM_SESSION_ALO_EDIT,
  ALO_ADD,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.OFFENCES_FROM_SESSION
  }

  displayApiData(): boolean {
    return this.pageType === PageRequestType.OFFENCES_FROM_API
  }

  isAloEdit(): boolean {
    return this.pageType === PageRequestType.OFFENCES_FROM_SESSION_ALO_EDIT
  }
}

export default class DetailsOfOffencePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    // This is actually the draftId
    const draftId = Number(req.params.draftId)
    const { draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(draftId, user)
    const offence = this.getOffences(req, draftAdjudication)
    if (!offence || Object.keys(offence).length === 0) {
      return res.render(`pages/detailsOfOffence`, {
        prisoner,
      })
    }
    const isYouthOffender = draftAdjudication.isYouthOffender || false
    const reportedChargeNumber = draftAdjudication.chargeNumber
    const { gender } = draftAdjudication
    const answerData = await this.decisionTreeService.answerDataDetails(offence, user)
    const offenceCode = Number(offence.offenceCode)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
      offenceCode,
      placeHolderValues,
      incidentRole,
      false
    )
    const offenceToDisplay = {
      questionsAndAnswers,
      incidentRule: draftAdjudication.incidentRole?.offenceRule,
      offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, isYouthOffender, gender, user),
      isYouthOffender,
    }

    return res.render(`pages/detailsOfOffence`, {
      prisoner,
      offence: offenceToDisplay,
      draftId,
      reportedChargeNumber,
      incidentRole,
      isYouthOffender,
      offenceData: offence,
      deleteOffenceLinkHidden: this.pageOptions.isAloEdit(),
      deleteOffenceHref: adjudicationUrls.detailsOfOffence.urls.delete(draftId, offence),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const draftId = Number(req.params.draftId)
    const isReportedAdjudication = !!req.body.reportedChargeNumber
    if (req.body.addFirstOffence) {
      return this.redirectToInitialOffenceSelectionPage(
        res,
        draftId,
        isReportedAdjudication,
        this.pageOptions.isAloEdit()
      )
    }

    if (this.pageOptions.displayApiData()) {
      return this.redirectToNextPage(res, draftId)
    }
    const offenceData: OffenceData = { ...req.query }

    const { victimOtherPersonsName, victimPrisonersNumber, victimStaffUsername, offenceCode } = offenceData

    const offenceDetailsToSave = {
      ...(victimOtherPersonsName && { victimOtherPersonsName }),
      ...(victimPrisonersNumber && { victimPrisonersNumber }),
      ...(victimStaffUsername && { victimStaffUsername }),
      ...(offenceCode && { offenceCode: Number(offenceCode) }),
    }

    if (this.pageOptions.isAloEdit()) {
      const adjudicationReport = await this.placeOnReportService.aloAmendOffenceDetails(
        draftId,
        offenceDetailsToSave,
        user
      )
      return res.redirect(adjudicationUrls.prisonerReport.urls.review(adjudicationReport?.chargeNumber))
    }
    await this.placeOnReportService.saveOffenceDetails(draftId, offenceDetailsToSave, user)
    return this.redirectToNextPage(res, draftId)
  }

  getOffences = (req: Request, draftAdjudication: DraftAdjudication): OffenceData => {
    if (this.pageOptions.displaySessionData() || this.pageOptions.isAloEdit()) {
      return { ...req.query }
    }
    const { offenceDetails } = draftAdjudication
    return offenceDetails
      ? {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
        }
      : {}
  }

  redirectToInitialOffenceSelectionPage = (
    res: Response,
    draftId: number,
    isReportedDraft: boolean,
    isAloEdit: boolean
  ) => {
    if (isAloEdit) {
      return res.redirect(adjudicationUrls.ageOfPrisoner.urls.aloSubmittedEditWithResettingOffences(draftId))
    }
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.ageOfPrisoner.urls.submittedEditWithResettingOffences(draftId))
    }
    return res.redirect(adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(draftId))
  }

  redirectToNextPage = (res: Response, draftId: number) => {
    return res.redirect(adjudicationUrls.detailsOfDamages.urls.start(draftId))
  }
}
