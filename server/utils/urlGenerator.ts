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

export const detailsOfOffence = {}
