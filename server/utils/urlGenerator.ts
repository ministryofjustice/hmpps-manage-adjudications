import url from 'url'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'
import { ContinueReportUiFilter } from '../routes/continueReport/continueReportFilterHelper'
import {
  AwardedPunishmentsAndDamagesUiFilter,
  DISUiFilter,
  PrintDISFormsUiFilter,
  UiFilter,
} from './adjudicationFilterHelper'

const adjudicationUrls = {
  offenceCodeSelection: {
    root: '/offence-code-selection',
    matchers: {
      question: (incidentRole: string, questionId: string) =>
        `/:draftId/:incidentRole(${incidentRole})/:questionId(${questionId})`,
      start: (incidentRole: string) => `/:draftId/:incidentRole(${incidentRole})`,
      aloEditStart: (incidentRole: string) => `/:draftId/aloEdit/:incidentRole(${incidentRole})`,
      aloEditQuestion: (incidentRole: string, questionId: string) =>
        `/:draftId/aloEdit/:incidentRole(${incidentRole})/:questionId(${questionId})`,
    },
    urls: {
      question: (draftId: number, incidentRole: string, questionUrl: string) => {
        return `${adjudicationUrls.offenceCodeSelection.root}/${draftId}/${incidentRole}/${questionUrl}`
      },
      start: (draftId: number, incidentRole: string) =>
        `${adjudicationUrls.offenceCodeSelection.root}/${draftId}/${incidentRole}`,
      aloEditStart: (draftId: number, incidentRole: string) =>
        `${adjudicationUrls.offenceCodeSelection.root}/${draftId}/aloEdit/${incidentRole}`,
      aloEditQuestion: (draftId: number, incidentRole: string, questionUrl: string) => {
        return `${adjudicationUrls.offenceCodeSelection.root}/${draftId}/aloEdit/${incidentRole}/${questionUrl}`
      },
    },
  },
  detailsOfOffence: {
    root: '/details-of-offence',
    matchers: {
      start: '/:draftId',
      modified: '/:draftId/modified',
      add: '/:draftId/add',
      aloAdd: '/:draftId/alo-add',
      delete: '/:draftId/delete',
      aloEdit: '/:draftId/aloEdit',
    },
    urls: {
      start: (draftId: number) => `${adjudicationUrls.detailsOfOffence.root}/${draftId}`,
      modified: (draftId: number) => `${adjudicationUrls.detailsOfOffence.root}/${draftId}/modified`,
      add: (draftId: number) => `${adjudicationUrls.detailsOfOffence.root}/${draftId}/add`,
      aloAdd: (draftId: number) => `${adjudicationUrls.detailsOfOffence.root}/${draftId}/alo-add`,
      delete: (draftId: number, offenceData: OffenceData) =>
        `${adjudicationUrls.detailsOfOffence.root}/${draftId}/delete?offenceCode=${offenceData?.offenceCode}&victimOtherPersonsName=${offenceData?.victimOtherPersonsName}&victimPrisonersNumber=${offenceData?.victimPrisonersNumber}&victimStaffUsername=${offenceData?.victimStaffUsername}`,
      aloEdit: (draftId: number) => `${adjudicationUrls.detailsOfOffence.root}/${draftId}/aloEdit`,
    },
  },
  detailsOfDamages: {
    root: '/damages',
    matchers: {
      start: '/:chargeNumber',
      add: '/:chargeNumber/add',
      modified: '/:chargeNumber/modified',
      submittedEdit: '/:chargeNumber/submitted/edit',
      submittedEditModified: '/:chargeNumber/submitted/edit/modified',
    },
    urls: {
      start: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfDamages.root}/${chargeNumber}`,
      add: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfDamages.root}/${chargeNumber}/add`,
      modified: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfDamages.root}/${chargeNumber}/modified`,
      submittedEdit: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfDamages.root}/${chargeNumber}/submitted/edit`,
      submittedEditModified: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfDamages.root}/${chargeNumber}/submitted/edit/modified`,
    },
  },
  detailsOfEvidence: {
    root: '/evidence',
    matchers: {
      start: '/:chargeNumber',
      add: '/:chargeNumber/add',
      modified: '/:chargeNumber/modified',
      submittedEdit: '/:chargeNumber/submitted/edit',
      submittedEditModified: '/:chargeNumber/submitted/edit/modified',
    },
    urls: {
      start: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfEvidence.root}/${chargeNumber}`,
      add: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfEvidence.root}/${chargeNumber}/add`,
      modified: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${chargeNumber}/modified`,
      submittedEdit: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${chargeNumber}/submitted/edit`,
      submittedEditModified: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${chargeNumber}/submitted/edit/modified`,
    },
  },
  detailsOfWitnesses: {
    root: '/witnesses',
    matchers: {
      start: '/:chargeNumber',
      add: '/:chargeNumber/add',
      modified: '/:chargeNumber/modified',
      submittedEdit: '/:chargeNumber/submitted/edit',
      submittedEditModified: '/:chargeNumber/submitted/edit/modified',
    },
    urls: {
      start: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfWitnesses.root}/${chargeNumber}`,
      add: (chargeNumber: string | number) => `${adjudicationUrls.detailsOfWitnesses.root}/${chargeNumber}/add`,
      modified: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${chargeNumber}/modified`,
      submittedEdit: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${chargeNumber}/submitted/edit`,
      submittedEditModified: (chargeNumber: string | number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${chargeNumber}/submitted/edit/modified`,
    },
  },
  taskList: {
    root: '/place-the-prisoner-on-report',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string | number) => `${adjudicationUrls.taskList.root}/${chargeNumber}`,
    },
  },
  confirmedOnReport: {
    root: '/prisoner-placed-on-report',
    matchers: {
      start: '/:chargeNumber',
      confirmationOfChange: '/:chargeNumber/changes-confirmed/report',
      confirmationOfChangePostReview: '/:chargeNumber/changes-confirmed/submitted-report',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.confirmedOnReport.root}/${chargeNumber}`,
      confirmationOfChange: (chargeNumber: string) =>
        `${adjudicationUrls.confirmedOnReport.root}/${chargeNumber}/changes-confirmed/report`,
      confirmationOfChangePostReview: (chargeNumber: string) =>
        `${adjudicationUrls.confirmedOnReport.root}/${chargeNumber}/changes-confirmed/submitted-report`,
    },
  },
  incidentDetails: {
    root: '/incident-details',
    matchers: {
      start: '/:prisonerNumber',
      edit: '/:prisonerNumber/:draftId/edit',
      submittedEdit: '/:prisonerNumber/:draftId/submitted/edit',
    },
    urls: {
      start: (prisonerNumber: string) => `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}`,
      edit: (prisonerNumber: string, draftId: number) =>
        `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}/${draftId}/edit`,
      submittedEdit: (prisonerNumber: string, draftId: number) =>
        `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}/${draftId}/submitted/edit`,
    },
  },
  selectGender: {
    root: '/select-gender',
    matchers: {
      start: '/:prisonerNumber',
      edit: '/:prisonerNumber/:draftId/edit',
    },
    url: {
      start: (prisonerNumber: string) => `${adjudicationUrls.selectGender.root}/${prisonerNumber}`,
      edit: (prisonerNumber: string, draftId: number) =>
        `${adjudicationUrls.selectGender.root}/${prisonerNumber}/${draftId}/edit`,
    },
  },
  createOnBehalfOf: {
    root: '/create-on-behalf-of',
    matchers: {
      start: '/:id',
      reason: '/:id/reason',
      check: '/:id/check',
    },
    urls: {
      start: (id: number | string) => `${adjudicationUrls.createOnBehalfOf.root}/${id}`,
      reason: (id: number | string) => `${adjudicationUrls.createOnBehalfOf.root}/${id}/reason`,
      check: (id: number | string) => `${adjudicationUrls.createOnBehalfOf.root}/${id}/check`,
    },
  },
  incidentRole: {
    root: '/incident-role',
    matchers: {
      start: '/:draftId',
      submittedEdit: '/:draftId/submitted/edit',
      aloSubmittedEdit: '/:draftId/submitted/edit/alo',
    },
    urls: {
      start: (draftId: number) => `${adjudicationUrls.incidentRole.root}/${draftId}`,
      submittedEdit: (draftId: number) => `${adjudicationUrls.incidentRole.root}/${draftId}/submitted/edit`,
      aloSubmittedEdit: (draftId: number) => `${adjudicationUrls.incidentRole.root}/${draftId}/submitted/edit/alo`,
    },
  },
  incidentAssociate: {
    root: '/associated-prisoner',
    matchers: {
      start: '/:draftId/:roleCode',
      submittedEdit: '/:draftId/:roleCode/submitted/edit',
      aloEdit: '/:draftId/:roleCode/submitted/edit/alo',
    },
    urls: {
      start: (draftId: number, roleCode: string) => `${adjudicationUrls.incidentAssociate.root}/${draftId}/${roleCode}`,
      submittedEdit: (draftId: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${draftId}/${roleCode}/submitted/edit`,
      aloEdit: (draftId: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${draftId}/${roleCode}/submitted/edit/alo`,
    },
  },
  incidentStatement: {
    root: '/incident-statement',
    matchers: {
      start: '/:draftId',
      submittedEdit: '/:draftId/submitted/edit',
    },
    urls: {
      start: (draftId: number) => `${adjudicationUrls.incidentStatement.root}/${draftId}`,
      submittedEdit: (draftId: number) => `${adjudicationUrls.incidentStatement.root}/${draftId}/submitted/edit`,
    },
  },
  searchForPrisoner: {
    root: '/search-for-prisoner',
    matchers: {
      start: '/',
    },
  },
  checkYourAnswers: {
    root: '/check-your-answers',
    matchers: {
      start: '/:draftId',
      reporterView: '/:draftId/report',
    },
    urls: {
      start: (draftId: number) => `${adjudicationUrls.checkYourAnswers.root}/${draftId}`,
      report: (draftId: number) => `${adjudicationUrls.checkYourAnswers.root}/${draftId}/report`,
    },
  },
  selectPrisoner: {
    root: '/select-prisoner',
    matchers: {
      start: '/',
    },
  },
  selectAssociatedPrisoner: {
    root: '/select-associated-prisoner',
    matchers: {
      start: '/',
    },
  },
  selectAssociatedStaff: {
    root: '/select-associated-staff',
    matchers: {
      start: '/',
    },
  },
  yourCompletedReports: {
    root: '/your-completed-reports',
    urls: {
      start: () => adjudicationUrls.yourCompletedReports.root,
      filter: (filter: UiFilter) =>
        url.format({
          pathname: adjudicationUrls.yourCompletedReports.root,
          query: { ...filter },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  allCompletedReports: {
    root: '/all-completed-reports',
    urls: {
      start: () => adjudicationUrls.allCompletedReports.root,
      filter: (filter: UiFilter) =>
        url.format({
          pathname: adjudicationUrls.allCompletedReports.root,
          query: { ...filter, transfersOnly: false },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  allTransferredReports: {
    root: '/all-transferred-reports',
    urls: {
      start: () => adjudicationUrls.allTransferredReports.root,
      filter: (filter: UiFilter) =>
        url.format({
          pathname: adjudicationUrls.allTransferredReports.root,
          query: { ...filter, transfersOnly: true },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  continueReport: {
    root: '/select-report',
    urls: {
      start: () => adjudicationUrls.continueReport.root,
      filter: (filter: ContinueReportUiFilter) =>
        url.format({
          pathname: adjudicationUrls.continueReport.root,
          query: { ...filter },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  deleteReport: {
    root: '/delete-report',
    urls: {
      delete: (id: number) => `${adjudicationUrls.deleteReport.root}/${id}`,
    },
    matchers: {
      delete: '/:id',
    },
  },
  printReport: {
    root: '/print-report',
    matchers: {
      dis12: '/:chargeNumber/dis12',
    },
    urls: {
      dis12: (chargeNumber: string) => `${adjudicationUrls.printReport.root}/${chargeNumber}/dis12`,
    },
  },
  forms: {
    root: '/print-issue-forms',
    matchers: {
      review: '/:chargeNumber/review',
    },
    urls: {
      review: (chargeNumber: string) => `${adjudicationUrls.forms.root}/${chargeNumber}/review`,
    },
  },
  printPdf: {
    root: '/print',
    matchers: {
      dis12: '/:chargeNumber/dis12/pdf',
      dis3: '/:chargeNumber/dis3/pdf',
      dis4: '/:chargeNumber/dis4/pdf',
      dis5: '/:chargeNumber/dis5/pdf',
      dis6: '/:chargeNumber/dis6/pdf',
      dis7: '/:chargeNumber/dis7/pdf',
    },
    urls: {
      dis12: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis12/pdf`,
      dis3: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis3/pdf`,
      dis4: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis4/pdf`,
      dis5: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis5/pdf`,
      dis6: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis6/pdf`,
      dis7: (chargeNumber: string) => `${adjudicationUrls.printPdf.root}/${chargeNumber}/dis7/pdf`,
    },
  },
  prisonerReport: {
    root: '/prisoner-report',
    matchers: {
      report: '/:chargeNumber/report',
      review: '/:chargeNumber/review',
      viewOnly: '/:chargeNumber/view',
    },
    urls: {
      report: (chargeNumber: string | number) => `${adjudicationUrls.prisonerReport.root}/${chargeNumber}/report`,
      review: (chargeNumber: string | number) => `${adjudicationUrls.prisonerReport.root}/${chargeNumber}/review`,
      viewOnly: (chargeNumber: string | number) => `${adjudicationUrls.prisonerReport.root}/${chargeNumber}/view`,
    },
  },
  deletePerson: {
    root: '/delete-person',
    matchers: {
      start: '/',
    },
  },
  ageOfPrisoner: {
    root: '/age-of-prisoner',
    matchers: {
      start: '/:draftId',
      submittedEdit: '/:draftId/submitted/edit',
    },
    urls: {
      start: (draftId: number) => `${adjudicationUrls.ageOfPrisoner.root}/${draftId}`,
      startWithResettingOffences: (draftId: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${draftId}?reselectingFirstOffence=true`,
      submittedEdit: (draftId: number) => `${adjudicationUrls.ageOfPrisoner.root}/${draftId}/submitted/edit`,
      submittedEditWithResettingOffences: (draftId: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${draftId}/submitted/edit?reselectingFirstOffence=true`,
      aloSubmittedEditWithResettingOffences: (draftId: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${draftId}/submitted/edit?reselectingFirstOffence=true&aloEdit=true`,
    },
  },
  hearingDetails: {
    root: '/hearing-details',
    matchers: {
      review: '/:chargeNumber/review',
      report: '/:chargeNumber/report',
      viewOnly: '/:chargeNumber/view',
    },
    urls: {
      review: (chargeNumber: string) => `${adjudicationUrls.hearingDetails.root}/${chargeNumber}/review`,
      report: (chargeNumber: string) => `${adjudicationUrls.hearingDetails.root}/${chargeNumber}/report`,
      viewOnly: (chargeNumber: string) => `${adjudicationUrls.hearingDetails.root}/${chargeNumber}/view`,
    },
  },
  scheduleHearing: {
    root: '/schedule-hearing',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:hearingId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.scheduleHearing.root}/${chargeNumber}`,
      edit: (chargeNumber: string, hearingId: number) =>
        `${adjudicationUrls.scheduleHearing.root}/${chargeNumber}/edit/${hearingId}`,
    },
  },
  viewScheduledHearings: {
    root: '/scheduled-hearings',
    matchers: {
      start: '/',
    },
    urls: {
      start: () => adjudicationUrls.viewScheduledHearings.root,
      filter: (hearingDate: string) =>
        url.format({
          pathname: adjudicationUrls.viewScheduledHearings.root,
          query: { hearingDate },
        }),
    },
  },
  acceptedReportConfirmation: {
    root: '/report-has-been-accepted',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.acceptedReportConfirmation.root}/${chargeNumber}`,
    },
  },
  confirmDISFormsIssued: {
    root: '/issue-DIS1-2',
    urls: {
      start: () => adjudicationUrls.confirmDISFormsIssued.root,
      filter: (filter: DISUiFilter) =>
        url.format({
          pathname: adjudicationUrls.confirmDISFormsIssued.root,
          query: { ...filter },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  addIssueDateTime: {
    root: '/add-issue-date-time',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.addIssueDateTime.root}/${chargeNumber}`,
    },
  },
  printCompletedDisForms: {
    root: '/print-completed-DIS-forms',
    matchers: {
      start: '/',
    },
    urls: {
      start: () => adjudicationUrls.printCompletedDisForms.root,
      filter: (filter: PrintDISFormsUiFilter) =>
        url.format({
          pathname: adjudicationUrls.printCompletedDisForms.root,
          query: { ...filter },
        }),
    },
  },
  enterHearingOutcome: {
    root: '/hearing-outcome',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.enterHearingOutcome.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.enterHearingOutcome.root}/${chargeNumber}/edit`,
    },
  },
  hearingPleaAndFinding: {
    root: '/hearing-plea-finding',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingPleaAndFinding.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.hearingPleaAndFinding.root}/${chargeNumber}/edit`,
    },
  },
  hearingReasonForReferral: {
    root: '/reason-for-referral',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingReasonForReferral.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.hearingReasonForReferral.root}/${chargeNumber}/edit`,
    },
  },
  govReasonForReferral: {
    root: '/reason-for-gov-referral',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.govReasonForReferral.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.govReasonForReferral.root}/${chargeNumber}/edit`,
    },
  },
  reasonForReferral: {
    root: '/reason-for-police-referral',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.reasonForReferral.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.reasonForReferral.root}/${chargeNumber}/edit`,
    },
  },
  hearingAdjourned: {
    root: '/hearing-adjourned',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingAdjourned.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.hearingAdjourned.root}/${chargeNumber}/edit`,
    },
  },
  hearingReferralConfirmation: {
    root: '/report-has-been-referred',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingReferralConfirmation.root}/${chargeNumber}`,
    },
  },
  nextStepsPolice: {
    root: '/next-steps/police',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.nextStepsPolice.root}/${chargeNumber}`,
    },
  },
  nextStepsInad: {
    root: '/next-steps/inad',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.nextStepsInad.root}/${chargeNumber}`,
    },
  },
  nextStepsGov: {
    root: '/next-steps/gov',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.nextStepsGov.root}/${chargeNumber}`,
    },
  },
  moneyRecoveredForDamages: {
    root: '/money-recovered',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.moneyRecoveredForDamages.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.moneyRecoveredForDamages.root}/${chargeNumber}/edit`,
    },
  },
  isThisACaution: {
    root: '/is-caution',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.isThisACaution.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.isThisACaution.root}/${chargeNumber}/edit`,
    },
  },
  hearingReasonForFinding: {
    root: '/reason-for-finding',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingReasonForFinding.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.hearingReasonForFinding.root}/${chargeNumber}/edit`,
    },
  },
  reasonForNotProceeding: {
    root: '/reason-for-not-proceeding',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
      completeHearingStart: '/complete-hearing/:chargeNumber',
      completeHearingEdit: '/complete-hearing/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.reasonForNotProceeding.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.reasonForNotProceeding.root}/${chargeNumber}/edit`,
      completeHearingStart: (chargeNumber: string) =>
        `${adjudicationUrls.reasonForNotProceeding.root}/complete-hearing/${chargeNumber}`,
      completeHearingEdit: (chargeNumber: string) =>
        `${adjudicationUrls.reasonForNotProceeding.root}/complete-hearing/${chargeNumber}/edit`,
    },
  },
  reportAQuashedGuiltyFinding: {
    root: '/report-quashed-guilty-finding',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.reportAQuashedGuiltyFinding.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.reportAQuashedGuiltyFinding.root}/${chargeNumber}/edit`,
    },
  },
  hearingsCheckAnswers: {
    root: '/check-answers-before-submitting-hearing',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.hearingsCheckAnswers.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.hearingsCheckAnswers.root}/${chargeNumber}/edit`,
    },
  },
  punishmentsAndDamages: {
    root: '/punishment-details',
    matchers: {
      review: '/:chargeNumber/review',
      report: '/:chargeNumber/report',
      viewOnly: '/:chargeNumber/view',
    },
    urls: {
      review: (chargeNumber: string) => `${adjudicationUrls.punishmentsAndDamages.root}/${chargeNumber}/review`,
      report: (chargeNumber: string) => `${adjudicationUrls.punishmentsAndDamages.root}/${chargeNumber}/report`,
      viewOnly: (chargeNumber: string) => `${adjudicationUrls.punishmentsAndDamages.root}/${chargeNumber}/view`,
    },
  },
  punishment: {
    root: '/punishment',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishment.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishment.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentSchedule: {
    root: '/punishment-schedule',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentSchedule.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentSchedule.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentNumberOfDays: {
    root: '/punishment-number-of-days',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentNumberOfDays.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentNumberOfDays.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentIsSuspended: {
    root: '/punishment-suspended',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentIsSuspended.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentIsSuspended.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentSuspendedUntil: {
    root: '/punishment-suspended-until',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentSuspendedUntil.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentSuspendedUntil.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  whenWillPunishmentStart: {
    root: '/when-will-punishment-start',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.whenWillPunishmentStart.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.whenWillPunishmentStart.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentStartDate: {
    root: '/punishment-start-date',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentStartDate.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentStartDate.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentAutomaticDateSchedule: {
    root: '/punishment-automatic-date-schedule',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.punishmentAutomaticDateSchedule.root}/${chargeNumber}`,
    },
  },
  numberOfAdditionalDays: {
    root: '/number-additional-days',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
      manualEdit: '/:chargeNumber/manualEdit/',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.numberOfAdditionalDays.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.numberOfAdditionalDays.root}/${chargeNumber}/edit/${redisId}`,
      manualEdit: (chargeNumber: string) =>
        `${adjudicationUrls.numberOfAdditionalDays.root}/${chargeNumber}/manualEdit`,
    },
  },
  // old version
  isPunishmentSuspendedAdditionalDays: {
    root: '/punishment-suspended-additional-days',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  // this is the new version below
  isPunishmentSuspendedAdditionalDays_v1: {
    root: '/is-punishment-suspended-additional-days',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) =>
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays_v1.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays_v1.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  punishmentSuspendedUntilAdditionalDays: {
    root: '/when-is-punishment-suspended-until-additional-days',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) =>
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  isPunishmentConsecutive: {
    root: '/punishment-consecutive',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.isPunishmentConsecutive.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.isPunishmentConsecutive.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  whichPunishmentIsItConsecutiveTo: {
    root: '/punishment-consecutive-to',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  whichPunishmentIsItConsecutiveToManual: {
    root: '/punishment-consecutive-to/manual',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) =>
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  manualConsecutivePunishmentError: {
    root: '/punishment-consecutive-to/manual/error',
    matchers: {
      start: '/:chargeId',
    },
    urls: {
      start: (chargeId: string) => `${adjudicationUrls.manualConsecutivePunishmentError.root}/${chargeId}`,
    },
  },
  awardPunishments: {
    root: '/award-punishments',
    matchers: {
      start: '/:chargeNumber',
      modified: '/:chargeNumber/modified',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.awardPunishments.root}/${chargeNumber}`,
      modified: (chargeNumber: string) => `${adjudicationUrls.awardPunishments.root}/${chargeNumber}/modified`,
    },
  },
  awardedPunishmentsAndDamages: {
    root: '/awarded-punishments-and-damages',
    matchers: {
      start: '/',
      financial: '/financial',
      additionalDays: '/additional-days',
    },
    urls: {
      start: () => adjudicationUrls.awardedPunishmentsAndDamages.root,
      filter: (filter: AwardedPunishmentsAndDamagesUiFilter) =>
        url.format({
          pathname: adjudicationUrls.awardedPunishmentsAndDamages.root,
          query: { ...filter },
        }),
      financial: () => `${adjudicationUrls.awardedPunishmentsAndDamages.root}/financial`,
      financialFilter: (filter: AwardedPunishmentsAndDamagesUiFilter) =>
        url.format({
          pathname: `${adjudicationUrls.awardedPunishmentsAndDamages.root}/financial`,
          query: { ...filter },
        }),
      additionalDays: () => `${adjudicationUrls.awardedPunishmentsAndDamages.root}/additional-days`,
      additionalDaysFilter: (filter: AwardedPunishmentsAndDamagesUiFilter) =>
        url.format({
          pathname: `${adjudicationUrls.awardedPunishmentsAndDamages.root}/additional-days`,
          query: { ...filter },
        }),
    },
  },
  reasonForChangePunishment: {
    root: '/punishments/reason-for-change',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.reasonForChangePunishment.root}/${chargeNumber}`,
      edit: (chargeNumber: string) => `${adjudicationUrls.reasonForChangePunishment.root}/${chargeNumber}/edit`,
    },
  },
  checkPunishments: {
    root: '/check-punishments',
    matchers: {
      start: '/:chargeNumber',
      submittedEdit: '/:chargeNumber/edit',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.checkPunishments.root}/${chargeNumber}`,
      submittedEdit: (chargeNumber: string) => `${adjudicationUrls.checkPunishments.root}/${chargeNumber}/edit`,
    },
  },
  activateSuspendedPunishments: {
    root: '/activate-suspended-punishments',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.activateSuspendedPunishments.root}/${chargeNumber}`,
    },
  },
  punishmentComment: {
    root: '/punishment-comment',
    matchers: {
      add: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:id',
      delete: '/:chargeNumber/delete/:id',
    },
    urls: {
      add: (chargeNumber: string) => `${adjudicationUrls.punishmentComment.root}/${chargeNumber}`,
      edit: (chargeNumber: string, id: number) =>
        `${adjudicationUrls.punishmentComment.root}/${chargeNumber}/edit/${id}`,
      delete: (chargeNumber: string, id: number) =>
        `${adjudicationUrls.punishmentComment.root}/${chargeNumber}/delete/${id}`,
    },
  },
  manuallyActivateSuspendedPunishment: {
    root: '/manually-activate-suspended-punishment',
    matchers: {
      start: '/:chargeNumber',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.manuallyActivateSuspendedPunishment.root}/${chargeNumber}`,
    },
  },
  suspendedPunishmentSchedule: {
    root: '/suspended-punishment-schedule',
    matchers: {
      existingPunishment: '/:chargeNumber/existing',
      manualPunishment: '/:chargeNumber/manual',
    },
    urls: {
      existing: (chargeNumber: string) =>
        `${adjudicationUrls.suspendedPunishmentSchedule.root}/${chargeNumber}/existing`,
      manual: (chargeNumber: string) => `${adjudicationUrls.suspendedPunishmentSchedule.root}/${chargeNumber}/manual`,
    },
  },
  suspendedPunishmentNumberOfDays: {
    root: '/suspended-punishment-number-days',
    matchers: {
      existingPunishment: '/:chargeNumber/existing',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      existing: (chargeNumber: string) =>
        `${adjudicationUrls.suspendedPunishmentNumberOfDays.root}/${chargeNumber}/existing`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.suspendedPunishmentNumberOfDays.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  suspendedPunishmentStartDateChoice: {
    root: '/suspended-punishment-date-choice',
    matchers: {
      existingPunishment: '/:chargeNumber/existing',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      existing: (chargeNumber: string) =>
        `${adjudicationUrls.suspendedPunishmentStartDateChoice.root}/${chargeNumber}/existing`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.suspendedPunishmentStartDateChoice.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  suspendedPunishmentStartDate: {
    root: '/suspended-punishment-start-date',
    matchers: {
      existingPunishment: '/:chargeNumber/existing',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      existing: (chargeNumber: string) =>
        `${adjudicationUrls.suspendedPunishmentStartDate.root}/${chargeNumber}/existing`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.suspendedPunishmentStartDate.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  suspendedPunishmentAutoDates: {
    root: '/suspended-punishment-schedule-check',
    matchers: {
      existingPunishment: '/:chargeNumber/existing',
    },
    urls: {
      existing: (chargeNumber: string) =>
        `${adjudicationUrls.suspendedPunishmentAutoDates.root}/${chargeNumber}/existing`,
    },
  },
  reviewerEditOffenceWarning: {
    root: '/edit-offence-warning',
    matchers: {
      edit: '/:chargeNumber',
    },
    urls: {
      edit: (chargeNumber: string) => `${adjudicationUrls.reviewerEditOffenceWarning.root}/${chargeNumber}`,
    },
  },
  damagesAmount: {
    root: '/damages-amount',
    matchers: {
      start: '/:chargeNumber',
      edit: '/:chargeNumber/edit/:redisId',
    },
    urls: {
      start: (chargeNumber: string) => `${adjudicationUrls.damagesAmount.root}/${chargeNumber}`,
      edit: (chargeNumber: string, redisId: string) =>
        `${adjudicationUrls.damagesAmount.root}/${chargeNumber}/edit/${redisId}`,
    },
  },
  dataInsights: {
    root: '/data-insights',
    matchers: {
      start: '/',
      totalsAdjudicationsAndLocations: '/totals-adjudications-and-locations',
      protectedAndResponsivityCharacteristics: '/protected-and-responsivity-characteristics',
      offenceType: '/offence-type',
      punishments: '/punishments',
      pleasAndFindings: '/pleas-and-findings',
    },
    urls: {
      start: () => `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.start}`,
      totalsAdjudicationsAndLocations: () =>
        `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.totalsAdjudicationsAndLocations}`,
      protectedAndResponsivityCharacteristics: (params: object = {}) => {
        const queryParams = Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join('&')
        return `${adjudicationUrls.dataInsights.root}${
          adjudicationUrls.dataInsights.matchers.protectedAndResponsivityCharacteristics
        }${queryParams ? `?${queryParams}` : ''}`
      },
      offenceType: (params: object = {}) => {
        const queryParams = Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join('&')
        return `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.offenceType}${
          queryParams ? `?${queryParams}` : ''
        }`
      },
      punishments: (params: object = {}) => {
        const queryParams = Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join('&')
        return `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.punishments}${
          queryParams ? `?${queryParams}` : ''
        }`
      },
      pleasAndFindings: () =>
        `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.pleasAndFindings}`,
    },
  },
  isPrisonerStillInEstablishment: {
    root: '/prisoner-in-establishment',
    matchers: {
      start: '/',
    },
    urls: {
      start: () => `${adjudicationUrls.isPrisonerStillInEstablishment.root}/`,
    },
  },
  homepage: {
    root: '/place-a-prisoner-on-report',
    matchers: {
      start: '/',
    },
  },
  maintenancePage: {
    root: '/planned-maintenance',
    matchers: {
      start: '*',
    },
  },
}

export default adjudicationUrls
