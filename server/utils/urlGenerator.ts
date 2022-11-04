import url from 'url'
import { UiFilter } from './adjudicationFilterHelper'

const adjudicationUrls = {
  offenceCodeSelection: {
    root: '/offence-code-selection',
    matchers: {
      question: (incidentRole: string, questionId: string) =>
        `/:adjudicationNumber/:incidentRole(${incidentRole})/:questionId(${questionId})`,
      start: (incidentRole: string) => `/:adjudicationNumber/:incidentRole(${incidentRole})`,
    },
    urls: {
      question: (adjudicationNumber: number, incidentRole: string, questionUrl: string) => {
        return `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}/${questionUrl}`
      },
      start: (adjudicationNumber: number, incidentRole: string) =>
        `${adjudicationUrls.offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}`,
    },
  },
  detailsOfOffence: {
    root: '/details-of-offence',
    matchers: {
      start: '/:adjudicationNumber',
      modified: '/:adjudicationNumber/modified',
      add: '/:adjudicationNumber/add',
      delete: '/:adjudicationNumber/delete/:offenceIndex',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}`,
      modified: (adjudicationNumber: number) =>
        `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/modified`,
      add: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/add`,
      delete: (adjudicationNumber: number, offenceIndex: number) =>
        `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}/delete/${offenceIndex}`,
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
  incidentRole: {
    root: '/incident-role',
    matchers: {
      start: '/:adjudicationNumber',
      submittedEdit: '/:adjudicationNumber/submitted/edit',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.incidentRole.root}/${adjudicationNumber}`,
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.incidentRole.root}/${adjudicationNumber}/submitted/edit`,
    },
  },
  incidentAssociate: {
    root: '/associated-prisoner',
    matchers: {
      start: '/:adjudicationNumber/:roleCode',
      submittedEdit: '/:adjudicationNumber/:roleCode/submitted/edit',
    },
    urls: {
      start: (adjudicationNumber: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${adjudicationNumber}/${roleCode}`,
      submittedEdit: (adjudicationNumber: number, roleCode: string) =>
        `${adjudicationUrls.incidentAssociate.root}/${adjudicationNumber}/${roleCode}/submitted/edit`,
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
          query: { ...filter },
        }),
    },
    matchers: {
      start: '/',
    },
  },
  selectReport: {
    root: '/select-report',
    matchers: {
      start: '/',
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
    },
    urls: {
      report: (adjudicationNumber: number) => `${adjudicationUrls.prisonerReport.root}/${adjudicationNumber}/report`,
      review: (adjudicationNumber: number) => `${adjudicationUrls.prisonerReport.root}/${adjudicationNumber}/review`,
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
    },
  },
  hearingDetails: {
    root: '/hearing-details',
    matchers: {
      review: '/:adjudicationNumber/review',
      report: '/:adjudicationNumber/report',
    },
    urls: {
      review: (adjudicationNumber: number) => `${adjudicationUrls.hearingDetails.root}/${adjudicationNumber}/review`,
      report: (adjudicationNumber: number) => `${adjudicationUrls.hearingDetails.root}/${adjudicationNumber}/report`,
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
  homepage: {
    root: '/place-a-prisoner-on-report',
    matchers: {
      start: '/',
    },
  },
}

export default adjudicationUrls
