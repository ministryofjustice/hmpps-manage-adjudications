import url from 'url'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'
import { ContinueReportUiFilter } from '../routes/continueReport/continueReportFilterHelper'
import { DISUiFilter, PrintDISFormsUiFilter, UiFilter } from './adjudicationFilterHelper'

const adjudicationUrls = {
  offenceCodeSelection: {
    root: '/offence-code-selection',
    matchers: {
      question: (incidentRole: string, questionId: string) =>
        `/:adjudicationNumber/:incidentRole(${incidentRole})/:questionId(${questionId})`,
      start: (incidentRole: string) => `/:adjudicationNumber/:incidentRole(${incidentRole})`,
      aloEditStart: (incidentRole: string) => `/:adjudicationNumber/aloEdit/:incidentRole(${incidentRole})`,
      aloEditQuestion: (incidentRole: string, questionId: string) =>
        `/:adjudicationNumber/aloEdit/:incidentRole(${incidentRole})/:questionId(${questionId})`,
    },
    urls: {
      question: (adjudicationNumber: number, incidentRole: string, questionUrl: string) => {
        return `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}/${questionUrl}`
      },
      start: (adjudicationNumber: number, incidentRole: string) =>
        `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}`,
      aloEditStart: (adjudicationNumber: number, incidentRole: string) =>
        `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/aloEdit/${incidentRole}`,
      aloEditQuestion: (adjudicationNumber: number, incidentRole: string, questionUrl: string) => {
        return `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/aloEdit/${incidentRole}/${questionUrl}`
      },
    },
  },
  detailsOfOffence: {
    root: '/details-of-offence',
    matchers: {
      start: '/:adjudicationNumber',
      modified: '/:adjudicationNumber/modified',
      add: '/:adjudicationNumber/add',
      aloAdd: '/:adjudicationNumber/alo-add',
      delete: '/:adjudicationNumber/delete',
      aloEdit: '/:adjudicationNumber/aloEdit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/modified`,
      add: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/add`,
      aloAdd: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/alo-add`,
      delete: (adjudicationNumber: number, offenceData: OffenceData) =>
        `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/delete?offenceCode=${offenceData?.offenceCode}&victimOtherPersonsName=${offenceData?.victimOtherPersonsName}&victimPrisonersNumber=${offenceData?.victimPrisonersNumber}&victimStaffUsername=${offenceData?.victimStaffUsername}`,
      aloEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/aloEdit`,
    },
  },
  detailsOfDamages: {
    root: '/damages',
    matchers: {
      start: '/:adjudicationNumber',
      add: '/:adjudicationNumber/add',
      modified: '/:adjudicationNumber/modified',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
      submittedEditModified: '/:adjudicationNumber/submitted/edit/modified',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfDamages.root}/${adjudicationNumber}`,
      add: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfDamages.root}/${adjudicationNumber}/add`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfDamages.root}/${adjudicationNumber}/modified`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfDamages.root}/${adjudicationNumber}/submitted/edit`,
      submittedEditModified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfDamages.root}/${adjudicationNumber}/submitted/edit/modified`,
    },
  },
  detailsOfEvidence: {
    root: '/evidence',
    matchers: {
      start: '/:adjudicationNumber',
      add: '/:adjudicationNumber/add',
      modified: '/:adjudicationNumber/modified',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
      submittedEditModified: '/:adjudicationNumber/submitted/edit/modified',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfEvidence.root}/${adjudicationNumber}`,
      add: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfEvidence.root}/${adjudicationNumber}/add`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${adjudicationNumber}/modified`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${adjudicationNumber}/submitted/edit`,
      submittedEditModified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfEvidence.root}/${adjudicationNumber}/submitted/edit/modified`,
    },
  },
  detailsOfWitnesses: {
    root: '/witnesses',
    matchers: {
      start: '/:adjudicationNumber',
      add: '/:adjudicationNumber/add',
      modified: '/:adjudicationNumber/modified',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
      submittedEditModified: '/:adjudicationNumber/submitted/edit/modified',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfWitnesses.root}/${adjudicationNumber}`,
      add: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfWitnesses.root}/${adjudicationNumber}/add`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${adjudicationNumber}/modified`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${adjudicationNumber}/submitted/edit`,
      submittedEditModified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfWitnesses.root}/${adjudicationNumber}/submitted/edit/modified`,
    },
  },
  taskList: {
    root: '/place-the-prisoner-on-report',
    matchers: {
      start: '/:id',
    },
    urls: {
      start: (id: number) => `${adjudicationUrls.taskList.root}/${id}`,
    },
  },
  confirmedOnReport: {
    root: '/prisoner-placed-on-report',
    matchers: {
      start: '/:adjudicationNumber',
      confirmationOfChange: '/:adjudicationNumber/changes-confirmed/report',
      confirmationOfChangePostReview: '/:adjudicationNumber/changes-confirmed/submitted-report',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}`,
      confirmationOfChange: (adjudicationNumber: number) =>
        `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/report`,
      confirmationOfChangePostReview: (adjudicationNumber: number) =>
        `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/submitted-report`,
    },
  },
  incidentDetails: {
    root: '/incident-details',
    matchers: {
      start: '/:prisonerNumber',
      edit: '/:prisonerNumber/:id/edit',
      submittedEdit: '/:prisonerNumber/:id/submitted/edit',
    },
    urls: {
      start: (prisonerNumber: string) => `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}`,
      edit: (prisonerNumber: string, id: number) =>
        `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}/${id}/edit`,
      submittedEdit: (prisonerNumber: string, id: number) =>
        `${adjudicationUrls.incidentDetails.root}/${prisonerNumber}/${id}/submitted/edit`,
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
  incidentRole: {
    root: '/incident-role',
    matchers: {
      start: '/:adjudicationNumber',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
      aloSubmittedEdit: '/:adjudicationNumber/submitted/edit/alo',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.incidentRole.root}/${adjudicationNumber}`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.incidentRole.root}/${adjudicationNumber}/submitted/edit`,
      aloSubmittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.incidentRole.root}/${adjudicationNumber}/submitted/edit/alo`,
    },
  },
  incidentAssociate: {
    root: '/associated-prisoner',
    matchers: {
      start: '/:adjudicationNumber/:roleCode',
      submittedEdit: '/:adjudicationNumber/:roleCode/submitted/edit',
      aloEdit: '/:adjudicationNumber/:roleCode/submitted/edit/alo',
    },
    urls: {
      start: (adjudicationNumber: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${adjudicationNumber}/${roleCode}`,
      submittedEdit: (adjudicationNumber: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${adjudicationNumber}/${roleCode}/submitted/edit`,
      aloEdit: (adjudicationNumber: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${adjudicationNumber}/${roleCode}/submitted/edit/alo`,
    },
  },
  incidentStatement: {
    root: '/incident-statement',
    matchers: {
      start: '/:adjudicationNumber',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.incidentStatement.root}/${adjudicationNumber}`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.incidentStatement.root}/${adjudicationNumber}/submitted/edit`,
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
      start: '/:adjudicationNumber',
      reporterView: '/:adjudicationNumber/report',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.checkYourAnswers.root}/${adjudicationNumber}`,
      report: (adjudicationNumber: number) => `${adjudicationUrls.checkYourAnswers.root}/${adjudicationNumber}/report`,
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
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.printReport.root}/${adjudicationNumber}`,
    },
  },
  printPdf: {
    root: '/print',
    matchers: {
      start: '/:adjudicationNumber/pdf',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.printPdf.root}/${adjudicationNumber}/pdf`,
    },
  },
  prisonerReport: {
    root: '/prisoner-report',
    matchers: {
      report: '/:adjudicationNumber/report',
      review: '/:adjudicationNumber/review',
      viewOnly: '/:adjudicationNumber/view',
    },
    urls: {
      report: (adjudicationNumber: number) => `${adjudicationUrls.prisonerReport.root}/${adjudicationNumber}/report`,
      review: (adjudicationNumber: number) => `${adjudicationUrls.prisonerReport.root}/${adjudicationNumber}/review`,
      viewOnly: (adjudicationNumber: number) => `${adjudicationUrls.prisonerReport.root}/${adjudicationNumber}/view`,
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
      start: '/:adjudicationNumber',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}`,
      startWithResettingOffences: (adjudicationNumber: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}?reselectingFirstOffence=true`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}/submitted/edit`,
      submittedEditWithResettingOffences: (adjudicationNumber: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}/submitted/edit?reselectingFirstOffence=true`,
      aloSubmittedEditWithResettingOffences: (adjudicationNumber: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}/submitted/edit?reselectingFirstOffence=true&aloEdit=true`,
    },
  },
  hearingDetails: {
    root: '/hearing-details',
    matchers: {
      review: '/:adjudicationNumber/review',
      report: '/:adjudicationNumber/report',
      viewOnly: '/:adjudicationNumber/view',
    },
    urls: {
      review: (adjudicationNumber: number) => `${adjudicationUrls.hearingDetails.root}/${adjudicationNumber}/review`,
      report: (adjudicationNumber: number) => `${adjudicationUrls.hearingDetails.root}/${adjudicationNumber}/report`,
      viewOnly: (adjudicationNumber: number) => `${adjudicationUrls.hearingDetails.root}/${adjudicationNumber}/view`,
    },
  },
  scheduleHearing: {
    root: '/schedule-hearing',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:hearingId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.scheduleHearing.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, hearingId: number) =>
        `${adjudicationUrls.scheduleHearing.root}/${adjudicationNumber}/edit/${hearingId}`,
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
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) =>
        `${adjudicationUrls.acceptedReportConfirmation.root}/${adjudicationNumber}`,
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
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.addIssueDateTime.root}/${adjudicationNumber}`,
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
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.enterHearingOutcome.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.enterHearingOutcome.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingPleaAndFinding: {
    root: '/hearing-plea-finding',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.hearingPleaAndFinding.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.hearingPleaAndFinding.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingReasonForReferral: {
    root: '/reason-for-referral',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.hearingReasonForReferral.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) =>
        `${adjudicationUrls.hearingReasonForReferral.root}/${adjudicationNumber}/edit`,
    },
  },
  reasonForReferral: {
    root: '/reason-for-police-referral',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.reasonForReferral.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.reasonForReferral.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingAdjourned: {
    root: '/hearing-adjourned',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.hearingAdjourned.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.hearingAdjourned.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingReferralConfirmation: {
    root: '/report-has-been-referred',
    matchers: {
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) =>
        `${adjudicationUrls.hearingReferralConfirmation.root}/${adjudicationNumber}`,
    },
  },
  nextStepsPolice: {
    root: '/next-steps/police',
    matchers: {
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.nextStepsPolice.root}/${adjudicationNumber}`,
    },
  },
  nextStepsInad: {
    root: '/next-steps/inad',
    matchers: {
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.nextStepsInad.root}/${adjudicationNumber}`,
    },
  },

  moneyRecoveredForDamages: {
    root: '/money-recovered',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.moneyRecoveredForDamages.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) =>
        `${adjudicationUrls.moneyRecoveredForDamages.root}/${adjudicationNumber}/edit`,
    },
  },
  isThisACaution: {
    root: '/is-caution',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.isThisACaution.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.isThisACaution.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingReasonForFinding: {
    root: '/reason-for-finding',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.hearingReasonForFinding.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) =>
        `${adjudicationUrls.hearingReasonForFinding.root}/${adjudicationNumber}/edit`,
    },
  },
  reasonForNotProceeding: {
    root: '/reason-for-not-proceeding',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
      completeHearingStart: '/complete-hearing/:adjudicationNumber',
      completeHearingEdit: '/complete-hearing/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.reasonForNotProceeding.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) =>
        `${adjudicationUrls.reasonForNotProceeding.root}/${adjudicationNumber}/edit`,
      completeHearingStart: (adjudicationNumber: number) =>
        `${adjudicationUrls.reasonForNotProceeding.root}/complete-hearing/${adjudicationNumber}`,
      completeHearingEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.reasonForNotProceeding.root}/complete-hearing/${adjudicationNumber}/edit`,
    },
  },
  reportAQuashedGuiltyFinding: {
    root: '/report-quashed-guilty-finding',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) =>
        `${adjudicationUrls.reportAQuashedGuiltyFinding.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) =>
        `${adjudicationUrls.reportAQuashedGuiltyFinding.root}/${adjudicationNumber}/edit`,
    },
  },
  hearingsCheckAnswers: {
    root: '/check-answers-before-submitting-hearing',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.hearingsCheckAnswers.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number) => `${adjudicationUrls.hearingsCheckAnswers.root}/${adjudicationNumber}/edit`,
    },
  },
  punishmentsAndDamages: {
    root: '/punishment-details',
    matchers: {
      review: '/:adjudicationNumber/review',
      report: '/:adjudicationNumber/report',
      viewOnly: '/:adjudicationNumber/view',
    },
    urls: {
      review: (adjudicationNumber: number) =>
        `${adjudicationUrls.punishmentsAndDamages.root}/${adjudicationNumber}/review`,
      report: (adjudicationNumber: number) =>
        `${adjudicationUrls.punishmentsAndDamages.root}/${adjudicationNumber}/report`,
      viewOnly: (adjudicationNumber: number) =>
        `${adjudicationUrls.punishmentsAndDamages.root}/${adjudicationNumber}/view`,
    },
  },
  punishment: {
    root: '/punishment',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:redisId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.punishment.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, redisId: string) =>
        `${adjudicationUrls.punishment.root}/${adjudicationNumber}/edit/${redisId}`,
    },
  },
  punishmentSchedule: {
    root: '/punishment-schedule',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:redisId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.punishmentSchedule.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, redisId: string) =>
        `${adjudicationUrls.punishmentSchedule.root}/${adjudicationNumber}/edit/${redisId}`,
    },
  },
  numberOfAdditionalDays: {
    root: '/number-additional-days',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:redisId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.numberOfAdditionalDays.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, redisId: string) =>
        `${adjudicationUrls.numberOfAdditionalDays.root}/${adjudicationNumber}/edit/${redisId}`,
    },
  },
  isPunishmentSuspended: {
    root: '/punishment-suspended',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:redisId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.isPunishmentSuspended.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, redisId: string) =>
        `${adjudicationUrls.isPunishmentSuspended.root}/${adjudicationNumber}/edit/${redisId}`,
    },
  },
  isPunishmentConsecutive: {
    root: '/punishment-consecutive',
    matchers: {
      start: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:redisId',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.isPunishmentConsecutive.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, redisId: string) =>
        `${adjudicationUrls.isPunishmentConsecutive.root}/${adjudicationNumber}/edit/${redisId}`,
    },
  },
  awardPunishments: {
    root: '/award-punishments',
    matchers: {
      start: '/:adjudicationNumber',
      modified: '/:adjudicationNumber/modified',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.awardPunishments.root}/${adjudicationNumber}`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.awardPunishments.root}/${adjudicationNumber}/modified`,
    },
  },
  checkPunishments: {
    root: '/check-punishments',
    matchers: {
      start: '/:adjudicationNumber',
      submittedEdit: '/:adjudicationNumber/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.checkPunishments.root}/${adjudicationNumber}`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.checkPunishments.root}/${adjudicationNumber}/edit`,
    },
  },
  activateSuspendedPunishments: {
    root: '/activate-suspended-punishments',
    matchers: {
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) =>
        `${adjudicationUrls.activateSuspendedPunishments.root}/${adjudicationNumber}`,
    },
  },
  punishmentComment: {
    root: '/punishment-comment',
    matchers: {
      add: '/:adjudicationNumber',
      edit: '/:adjudicationNumber/edit/:id',
      delete: '/:adjudicationNumber/delete/:id',
    },
    urls: {
      add: (adjudicationNumber: number) => `${adjudicationUrls.punishmentComment.root}/${adjudicationNumber}`,
      edit: (adjudicationNumber: number, id: number) =>
        `${adjudicationUrls.punishmentComment.root}/${adjudicationNumber}/edit/${id}`,
      delete: (adjudicationNumber: number, id: number) =>
        `${adjudicationUrls.punishmentComment.root}/${adjudicationNumber}/delete/${id}`,
    },
  },
  manuallyActivateSuspendedPunishment: {
    root: '/manually-activate-suspended-punishment',
    matchers: {
      start: '/:adjudicationNumber',
    },
    urls: {
      start: (adjudicationNumber: number) =>
        `${adjudicationUrls.manuallyActivateSuspendedPunishment.root}/${adjudicationNumber}`,
    },
  },
  suspendedPunishmentSchedule: {
    root: '/suspended-punishment-schedule',
    matchers: {
      existingPunishment: '/:adjudicationNumber/existing',
      manualPunishment: '/:adjudicationNumber/manual',
    },
    urls: {
      existing: (adjudicationNumber: number) =>
        `${adjudicationUrls.suspendedPunishmentSchedule.root}/${adjudicationNumber}/existing`,
      manual: (adjudicationNumber: number) =>
        `${adjudicationUrls.suspendedPunishmentSchedule.root}/${adjudicationNumber}/manual`,
    },
  },
  reviewerEditOffenceWarning: {
    root: '/edit-offence-warning',
    matchers: {
      edit: '/:adjudicationNumber',
    },
    urls: {
      edit: (adjudicationNumber: number) => `${adjudicationUrls.reviewerEditOffenceWarning.root}/${adjudicationNumber}`,
    },
  },
  dataInsights: {
    root: '/data-insights',
    matchers: {
      start: '/',
      totalsAdjudicationsAndLocations: '/totals-adjudications-and-locations',
      protectedCharacteristicsAndVulnerabilities: '/protected-characteristics-and-vulnerabilities',
      offenceType: '/offence-type',
      punishments: '/punishments',
      pleasAndFindings: '/pleas-and-findings',
    },
    urls: {
      start: () => `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.start}`,
      totalsAdjudicationsAndLocations: () =>
        `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.totalsAdjudicationsAndLocations}`,
      protectedCharacteristicsAndVulnerabilities: (characteristic?: string) =>
        `${adjudicationUrls.dataInsights.root}${
          adjudicationUrls.dataInsights.matchers.protectedCharacteristicsAndVulnerabilities
        }${characteristic ? `?characteristic=${characteristic}` : ''}`,
      offenceType: (offenceType?: string) =>
        `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.offenceType}${
          offenceType ? `?offence-type=${offenceType}` : ''
        }`,
      punishments: (offenceType?: string) =>
        `${adjudicationUrls.dataInsights.root}${adjudicationUrls.dataInsights.matchers.punishments}${
          offenceType ? `?offence-type=${offenceType}` : ''
        }`,
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
