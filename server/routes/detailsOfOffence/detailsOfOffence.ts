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
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.OFFENCES_FROM_SESSION
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(adjudicationNumber, user)
    const offence = this.getOffences(req, draftAdjudication)

    if (!offence || Object.keys(offence).length === 0) {
      return res.render(`pages/detailsOfOffence`, {
        prisoner,
      })
    }
    const isYouthOffender = draftAdjudication.isYouthOffender || false
    const reportedAdjudicationNumber = draftAdjudication.adjudicationNumber
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
      adjudicationNumber,
      reportedAdjudicationNumber,
      incidentRole,
      isYouthOffender,
      offenceData: offence,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const isReportedAdjudication = !!req.body.reportedAdjudicationNumber
    if (req.body.addFirstOffence) {
      return this.redirectToInitialOffenceSelectionPage(res, adjudicationNumber, isReportedAdjudication)
    }
    // Saving the offences for a draft just means continue
    if (!this.pageOptions.displaySessionData()) {
      // this.allOffencesSessionService.deleteSessionOffences(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber)
    }
    const offenceData: OffenceData = { ...req.query }

    const offenceDetailsToSave = {
      victimOtherPersonsName: offenceData?.victimOtherPersonsName,
      victimPrisonersNumber: offenceData?.victimPrisonersNumber,
      victimStaffUsername: offenceData?.victimStaffUsername,
      offenceCode: Number(offenceData?.offenceCode),
    }
    await this.placeOnReportService.saveOffenceDetails(adjudicationNumber, offenceDetailsToSave, user)
    return this.redirectToNextPage(res, adjudicationNumber)
  }

  getOffences = (req: Request, draftAdjudication: DraftAdjudication): OffenceData => {
    if (this.pageOptions.displaySessionData()) {
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

  redirectToInitialOffenceSelectionPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.ageOfPrisoner.urls.submittedEditWithResettingOffences(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(adjudicationNumber))
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number) => {
    return res.redirect(adjudicationUrls.detailsOfDamages.urls.start(adjudicationNumber))
  }
}
