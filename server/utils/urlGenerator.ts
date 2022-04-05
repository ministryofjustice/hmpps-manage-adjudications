export const offenceCodeSelection = {
  root: '/offence-code-selection',
  matchers: {
    question: (incidentRole: string, questionUrl: string) =>
      `/:adjudicationNumber/:incidentRole(${incidentRole})/${questionUrl}`,
    start: (incidentRole: string) => `/:adjudicationNumber/:incidentRole(${incidentRole})`,
  },
  urls: {
    question: (adjudicationNumber: number, incidentRole: string, questionUrl: string) => {
      return `${offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}/${questionUrl}`
    },
    start: (adjudicationNumber: number, incidentRole: string) =>
      `${offenceCodeSelection.root}/${adjudicationNumber}/${incidentRole}`,
  },
}

export const detailsOfOffence = {
  root: '/details-of-offence',
  matchers: {
    start: '/:adjudicationNumber',
    add: '/:adjudicationNumber/add',
    delete: '/:adjudicationNumber/delete/:offenceIndex',
  },
  urls: {
    start: (adjudicationNumber: number) => `${detailsOfOffence.root}/${adjudicationNumber}`,
    add: (adjudicationNumber: number) => `${detailsOfOffence.root}/${adjudicationNumber}/add`,
    delete: (adjudicationNumber: number, offenceIndex: number) =>
      `${detailsOfOffence.root}/${adjudicationNumber}/delete/${offenceIndex}`,
  },
}

export const taskList = {
  root: '/place-the-prisoner-on-report',
  matchers: {
    start: '/:id',
  },
  urls: {
    start: (id: number) => `${taskList.root}/${id}`,
  },
}

export const confirmedOnReport = {
  root: '/prisoner-placed-on-report',
  matchers: {
    start: '/:adjudicationNumber',
    reporterView: '/:adjudicationNumber/changes-confirmed/report',
    reviewerView: '/:adjudicationNumber/changes-confirmed/review',
  },
  urls: {
    start: (adjudicationNumber: number) => `${confirmedOnReport.root}/${adjudicationNumber}`,
    reporterView: (adjudicationNumber: number) =>
      `${confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/report`,
    reviewerView: (adjudicationNumber: number) =>
      `${confirmedOnReport.root}/${adjudicationNumber}/changes-confirmed/review`,
  },
}
