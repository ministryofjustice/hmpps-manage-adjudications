/* eslint-disable import/prefer-default-export */
import { NextStep } from '../../../data/OutcomeResult'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import adjudicationUrls from '../../../utils/urlGenerator'

export const getSchedulingUnavailableStatuses = (reportedAdjudication: ReportedAdjudication): boolean => {
  // Including ACCEPTED here so that we can deal with the edgecase early
  // Legacy ACCEPTED reports should not have hearings or outcomes
  return (
    reportedAdjudication.status === ReportedAdjudicationStatus.AWAITING_REVIEW ||
    reportedAdjudication.status === ReportedAdjudicationStatus.REJECTED ||
    reportedAdjudication.status === ReportedAdjudicationStatus.RETURNED ||
    reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED
  )
}

export const getNextPageForChosenStep = (nextStep: NextStep, adjudicationNumber: number): string => {
  switch (nextStep) {
    case NextStep.SCHEDULE_HEARING:
      return adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber)
    case NextStep.REFER_POLICE:
      return adjudicationUrls.reasonForReferral.urls.start(adjudicationNumber)
    case NextStep.NOT_PROCEED:
      return adjudicationUrls.reasonForNotProceeding.urls.start(adjudicationNumber)
    default:
      return null
  }
}