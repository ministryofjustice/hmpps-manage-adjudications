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
      // TODO - Rename
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
      reporterView: '/:adjudicationNumber/changes-confirmed/report',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}`,
      reporterView: (adjudicationNumber: number) =>
        `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/report`,
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
      submittedEdit: (adjudicationNumber: number) =>
        `${adjudicationUrls.ageOfPrisoner.root}/${adjudicationNumber}/submitted/edit`,
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
