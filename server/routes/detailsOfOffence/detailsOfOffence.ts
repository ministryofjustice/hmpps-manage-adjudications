/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import { getPlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import { DraftAdjudication } from '../../data/DraftAdjudicationResult'
import {
  OffenceData,
  ProtectedCharacteristicsTypes,
  getProtectedCharacteristicsTypeByIndex,
} from '../offenceCodeDecisions/offenceData'

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
    private readonly decisionTreeService: DecisionTreeService,
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
      false,
      offence.protectedCharacteristics,
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
      deleteOffenceHref: adjudicationUrls.detailsOfOffence.urls.delete(draftId, {
        ...offence,
        protectedCharacteristics: this.convertProtectedCharacteristics(req, draftAdjudication),
      }),
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
        this.pageOptions.isAloEdit(),
      )
    }

    if (this.pageOptions.displayApiData()) {
      return this.redirectToNextPage(res, draftId)
    }

    const protectedCharacteristics = this.convertProtectedCharacteristics(req)
    const offenceData: OffenceData = { ...req.query }
    const { victimOtherPersonsName, victimPrisonersNumber, victimStaffUsername, offenceCode } = offenceData

    const offenceDetailsToSave = {
      ...(victimOtherPersonsName && victimOtherPersonsName !== 'undefined' && { victimOtherPersonsName }),
      ...(victimPrisonersNumber && victimPrisonersNumber !== 'undefined' && { victimPrisonersNumber }),
      ...(victimStaffUsername && victimStaffUsername !== 'undefined' && { victimStaffUsername }),
      ...(offenceCode && { offenceCode: Number(offenceCode) }),
      ...(protectedCharacteristics.length !== 0 && {
        protectedCharacteristics: protectedCharacteristics.map(pc =>
          getProtectedCharacteristicsTypeByIndex(+pc.slice(-1)),
        ),
      }),
    }

    if (this.pageOptions.isAloEdit()) {
      const adjudicationReport = await this.placeOnReportService.aloAmendOffenceDetails(
        draftId,
        offenceDetailsToSave,
        user,
      )
      return res.redirect(adjudicationUrls.prisonerReport.urls.review(adjudicationReport?.chargeNumber))
    }
    await this.placeOnReportService.saveOffenceDetails(draftId, offenceDetailsToSave, user)
    return this.redirectToNextPage(res, draftId)
  }

  getOffences = (req: Request, draftAdjudication: DraftAdjudication): OffenceData => {
    if (this.pageOptions.displaySessionData() || this.pageOptions.isAloEdit()) {
      if (Object.keys(req.query).length === 0) {
        return {}
      }
      const protectedCharacteristicEnums: ProtectedCharacteristicsTypes[] = []
      if (req.query.protectedCharacteristics && typeof req.query.protectedCharacteristics !== 'string') {
        const protectedCharacteristics = (req.query.protectedCharacteristics ?? []) as string[]

        protectedCharacteristics.forEach(pc => {
          protectedCharacteristicEnums.push(getProtectedCharacteristicsTypeByIndex(+pc.slice(-1)))
        })
      } else if (req.query.protectedCharacteristics) {
        protectedCharacteristicEnums.push(
          getProtectedCharacteristicsTypeByIndex(+req.query.protectedCharacteristics.toString().slice(-1)),
        )
      }

      return {
        ...req.query,
        protectedCharacteristics: protectedCharacteristicEnums,
      }
    }
    const { offenceDetails } = draftAdjudication
    return offenceDetails
      ? {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
          protectedCharacteristics: offenceDetails.protectedCharacteristics,
        }
      : {}
  }

  redirectToInitialOffenceSelectionPage = (
    res: Response,
    draftId: number,
    isReportedDraft: boolean,
    isAloEdit: boolean,
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

  private convertProtectedCharacteristics = (req: Request, draftAdjudication: DraftAdjudication = null): string[] => {
    const protectedCharacteristics: string[] = []
    if (this.pageOptions.displaySessionData() || this.pageOptions.isAloEdit()) {
      if (req.query.protectedCharacteristics) {
        if (typeof req.query.protectedCharacteristics !== 'string') {
          protectedCharacteristics.push(...(req.query.protectedCharacteristics as string[]))
        } else {
          protectedCharacteristics.push(req.query.protectedCharacteristics)
        }
      }
    } else if (draftAdjudication) {
      draftAdjudication.offenceDetails?.protectedCharacteristics?.forEach(pc => {
        protectedCharacteristics.push(`${Object.keys(ProtectedCharacteristicsTypes).indexOf(pc) + 1}`)
      })
    }
    return protectedCharacteristics
  }
}
