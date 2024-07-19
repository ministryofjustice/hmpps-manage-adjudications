import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationResult, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()

const reportedAdjudicationResponse = ({
  chargeNumber,
  status,
  reviewedByUserId = null,
  statusReason = null,
  statusDetails = null,
  isYouthOffender = false,
}: {
  chargeNumber: string
  status: ReportedAdjudicationStatus
  reviewedByUserId?: string
  statusReason?: string
  statusDetails?: string
  isYouthOffender: boolean
}) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      locationId: 25538,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      dateTimeOfDiscovery: '2021-12-10T09:40:00',
      status,
      incidentStatement: {
        statement: 'TESTING',
        completed: true,
      },
      damages: [testData.singleDamage({})],
      evidence: [testData.singleEvidence({ identifier: 'JO48376' })],
      witnesses: [testData.singleWitness({})],
      offenceDetails: {
        offenceCode: 1001,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G5512G',
      },
      incidentRole: {
        associatedPrisonersNumber: 'T3356FU',
        roleCode: '25c',
        offenceRule: {
          paragraphNumber: '25(c)',
          paragraphDescription:
            'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
        },
      },
      otherData: {
        reviewedByUserId,
        statusReason,
        statusDetails,
        isYouthOffender,
      },
    }),
  }
}

const draftAdjudicationResponse = (reportedAdj: ReportedAdjudicationResult, id: number) => {
  const { reportedAdjudication } = reportedAdj
  return {
    draftAdjudication: testData.draftAdjudication({
      id,
      locationId: 25538,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      dateTimeOfDiscovery: '2021-12-10T09:40:00',
      ...reportedAdjudication,
    }),
  }
}

context('Prisoner report - reporter view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Associated Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 25538,
      response: {
        locationId: 25538,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
    })

    const awaitingReviewReport = reportedAdjudicationResponse({
      chargeNumber: '12345',
      status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      isYouthOffender: false,
    })

    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: awaitingReviewReport,
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '12345',
      response: draftAdjudicationResponse(awaitingReviewReport, 177),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: draftAdjudicationResponse(awaitingReviewReport, 177),
    })

    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: reportedAdjudicationResponse({
        chargeNumber: '56789',
        status: ReportedAdjudicationStatus.REJECTED,
        isYouthOffender: false,
        reviewedByUserId: 'USER1',
        statusReason: 'expired',
        statusDetails: 'Too long ago to report now.',
      }),
    })

    const returnedReport = reportedAdjudicationResponse({
      chargeNumber: '1524493',
      status: ReportedAdjudicationStatus.RETURNED,
      reviewedByUserId: 'USER1',
      statusReason: 'statement',
      statusDetails: 'More detail please.',
      isYouthOffender: true,
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: returnedReport,
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '1524493',
      response: draftAdjudicationResponse(returnedReport, 188),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 188,
      response: draftAdjudicationResponse(returnedReport, 188),
    })

    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubGetAgency', {
      agencyId: 'MDI',
      response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
    })

    return cy.signIn()
  })
  describe('Report status AWAITING_REVIEW', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('not.exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Awaiting review')
      prisonerReportPage.reviewSummary().should('not.exist')
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .reportDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date report submitted')
          expect($summaryLabels.get(2).innerText).to.contain('Time report submitted')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(1).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(4).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .reportDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(2).innerText).to.contain('9 December 2022')
          expect($summaryData.get(3).innerText).to.contain('10:30')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('9 December 2021')
          expect($summaryData.get(1).innerText).to.contain('10:30')
          expect($summaryData.get(2).innerText).to.contain('Houseblock 1')
          expect($summaryData.get(3).innerText).to.contain('10 December 2021')
          expect($summaryData.get(4).innerText).to.contain('09:40')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      cy.get('h1').should('contain.text', '12345')
    })
    it('should not contain the review panel', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should have change links present', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('exist')
      prisonerReportPage.evidenceChangeLink().should('exist')
      prisonerReportPage.witnessesChangeLink().should('exist')
      prisonerReportPage.incidentDetailsChangeLink().should('exist')
      prisonerReportPage.offenceDetailsChangeLink().should('exist')
      prisonerReportPage.incidentStatementChangeLink().should('exist')
    })
    it('should go to the damages page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEdit(12345))
      })
    })
    it('should go to the evidence page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.evidenceChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.submittedEdit(12345))
      })
    })
    it('should go to the witnesses page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.witnessesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(12345))
      })
    })
  })
  describe('Report status RETURNED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Returned')
      prisonerReportPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
          expect($summaryLabels.get(1).innerText).to.contain('Reason for return')
          expect($summaryLabels.get(2).innerText).to.contain('Details')
        })

      prisonerReportPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('Incorrect or insufficient information in statement')
          expect($summaryData.get(2).innerText).to.contain('More detail please.')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .reportDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date report submitted')
          expect($summaryLabels.get(2).innerText).to.contain('Time report submitted')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(1).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(4).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .reportDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(2).innerText).to.contain('9 December 2022')
          expect($summaryData.get(3).innerText).to.contain('10:30')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('9 December 2021')
          expect($summaryData.get(1).innerText).to.contain('10:30')
          expect($summaryData.get(2).innerText).to.contain('Houseblock 1')
          expect($summaryData.get(3).innerText).to.contain('10 December 2021')
          expect($summaryData.get(4).innerText).to.contain('09:40')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('YOI offences\n\nPrison rule 55')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 55, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 55, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      cy.get('h1').should('contain.text', '1524493')
    })
    it('should not contain the review panel', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should have change links present', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('exist')
      prisonerReportPage.evidenceChangeLink().should('exist')
      prisonerReportPage.witnessesChangeLink().should('exist')
      prisonerReportPage.incidentDetailsChangeLink().should('exist')
      prisonerReportPage.offenceDetailsChangeLink().should('exist')
      prisonerReportPage.incidentStatementChangeLink().should('exist')
    })
    it('should go to the damages page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEdit(1524493))
      })
    })
    it('should go to the evidence page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.evidenceChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.submittedEdit(1524493))
      })
    })
    it('should go to the witnesses page if the change link is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.witnessesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(1524493))
      })
    })
  })
  describe('Report status REJECTED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('not.exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Rejected')
      prisonerReportPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
          expect($summaryLabels.get(1).innerText).to.contain('Reason for rejection')
          expect($summaryLabels.get(2).innerText).to.contain('Details')
        })

      prisonerReportPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('More than 48 hours have elapsed since the incident')
          expect($summaryData.get(2).innerText).to.contain('Too long ago to report now.')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(1).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(4).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('9 December 2021')
          expect($summaryData.get(1).innerText).to.contain('10:30')
          expect($summaryData.get(2).innerText).to.contain('Houseblock 1')
          expect($summaryData.get(3).innerText).to.contain('10 December 2021')
          expect($summaryData.get(4).innerText).to.contain('09:40')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      cy.get('h1').should('contain.text', '56789')
    })
    it('should not contain the review panel', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should not have any change links present', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.report(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('not.exist')
      prisonerReportPage.evidenceChangeLink().should('not.exist')
      prisonerReportPage.witnessesChangeLink().should('not.exist')
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
      prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
  })
})
