import url from 'url'
import { ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'

const adjudicationUrls = {
  offenceCodeSelection: {
    root: '/offence-code-selection',
    matchers: {
      question: (incidentRole: string, questionUrl: string) =>
        `/:adjudicationNumber/:incidentRole(${incidentRole})/${questionUrl}`,
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
      add: '/:adjudicationNumber/add',
      delete: '/:adjudicationNumber/delete/:offenceIndex',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.detailsOfOffence.root}/${adjudicationNumber}`,
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
      reviewerView: '/:adjudicationNumber/changes-confirmed/review',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}`,
      reporterView: (adjudicationNumber: number) =>
        `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/report`,
      reviewerView: (adjudicationNumber: number) =>
        `${adjudicationUrls.confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/review`,
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
      reviewerView: '/:adjudicationNumber/review',
    },
    urls: {
      start: (adjudicationNumber: number) => `${adjudicationUrls.checkYourAnswers.root}/${adjudicationNumber}`,
      report: (adjudicationNumber: number) => `${adjudicationUrls.checkYourAnswers.root}/${adjudicationNumber}/report`,
      review: (adjudicationNumber: number) => `${adjudicationUrls.checkYourAnswers.root}/${adjudicationNumber}/review`,
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
      filter: (fromDate: string, toDate: string, status: ReportedAdjudicationStatus) =>
        url.format({
          pathname: adjudicationUrls.yourCompletedReports.root,
          query: {
            fromDate,
            toDate,
            status,
          },
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
      filter: (fromDate: string, toDate: string, status: ReportedAdjudicationStatus) =>
        url.format({
          pathname: adjudicationUrls.allCompletedReports.root,
          query: {
            fromDate,
            toDate,
            status,
          },
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
  homepage: {
    root: '/place-a-prisoner-on-report',
    matchers: {
      start: '/',
    },
  },
}

export default adjudicationUrls
