/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
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
    private readonly allOffencesSessionService: AllOffencesSessionService,
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
    const allOffences = this.getOffences(req, adjudicationNumber, draftAdjudication)
    // If we are not displaying session data then fill in the session data
    if (!this.pageOptions.displaySessionData()) {
      // Set up session to allow for adding and deleting
      this.allOffencesSessionService.setAllSessionOffences(req, allOffences, adjudicationNumber)
    }

    if (!allOffences || allOffences.length < 1) {
      return res.render(`pages/detailsOfOffence`, {
        prisoner,
      })
    }
    const isYouthOffender = draftAdjudication.isYouthOffender || false
    const reportedAdjudicationNumber = draftAdjudication.adjudicationNumber
    const offences = await Promise.all(
      allOffences.map(async offenceData => {
        const answerData = await this.decisionTreeService.answerDataDetails(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.decisionTreeService.questionsAndAnswers(
          offenceCode,
          placeHolderValues,
          incidentRole,
          false
        )
        return {
          questionsAndAnswers,
          incidentRule: draftAdjudication.incidentRole?.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, isYouthOffender, user),
          isYouthOffender,
        }
      })
    )
    return res.render(`pages/detailsOfOffence`, {
      prisoner,
      offences,
      adjudicationNumber,
      reportedAdjudicationNumber,
      incidentRole,
      isYouthOffender,
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
      this.allOffencesSessionService.deleteAllSessionOffences(req, adjudicationNumber)
      return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
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
    return this.redirectToNextPage(res, adjudicationNumber, isReportedAdjudication)
  }

  getOffences = (req: Request, adjudicationNumber: number, draftAdjudication: DraftAdjudication): OffenceData[] => {
    if (this.pageOptions.displaySessionData()) {
      return this.allOffencesSessionService.getAllSessionOffences(req, adjudicationNumber)
    }
    return (
      draftAdjudication.offenceDetails?.map(offenceDetails => {
        return {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
        }
      }) || []
    )
  }

  redirectToInitialOffenceSelectionPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.ageOfPrisoner.urls.submittedEditWithResettingOffences(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(adjudicationNumber))
  }

  redirectToNextPage = (res: Response, adjudicationNumber: number, isReportedDraft: boolean) => {
    if (isReportedDraft) {
      return res.redirect(adjudicationUrls.incidentStatement.urls.submittedEdit(adjudicationNumber))
    }
    return res.redirect(adjudicationUrls.incidentStatement.urls.start(adjudicationNumber))
  }
}
