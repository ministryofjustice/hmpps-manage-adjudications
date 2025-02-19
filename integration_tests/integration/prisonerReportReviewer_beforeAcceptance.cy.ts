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
  return testData.reportedAdjudication({
    chargeNumber,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-12-09T10:30:00',
    status,
    locationId: 25538,
    incidentStatement: {
      statement: 'TESTING',
      completed: true,
    },
    offenceDetails: {
      offenceCode: 1001,
      offenceRule: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
      victimPrisonersNumber: 'G5512G',
    },
    damages: [testData.singleDamage({})],
    evidence: [testData.singleEvidence({ identifier: 'JO48376' })],
    witnesses: [testData.singleWitness({})],
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
  })
}

const draftAdjudication = (reportedAdj: ReportedAdjudicationResult, id: number) => {
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

context('Prisoner report - reviewer view', () => {
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

    const awaitingReviewReport = {
      reportedAdjudication: reportedAdjudicationResponse({
        chargeNumber: '12345',
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        isYouthOffender: false,
      }),
    }
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: awaitingReviewReport,
    })
    const returnedReport = {
      reportedAdjudication: reportedAdjudicationResponse({
        chargeNumber: '56789',
        status: ReportedAdjudicationStatus.RETURNED,
        reviewedByUserId: 'USER1',
        statusReason: 'offence',
        statusDetails: 'I think this is the incorrect offence',
        isYouthOffender: false,
      }),
    }
    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: returnedReport,
    })
    const rejectedReport = {
      reportedAdjudication: reportedAdjudicationResponse({
        chargeNumber: '356789',
        status: ReportedAdjudicationStatus.REJECTED,
        reviewedByUserId: 'USER1',
        statusReason: 'unsuitable',
        statusDetails: 'This is not worthy of an adjudication',
        isYouthOffender: false,
      }),
    }
    cy.task('stubGetReportedAdjudication', {
      id: 356789,
      response: rejectedReport,
    })

    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: 12345,
      response: draftAdjudication(awaitingReviewReport, 1),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: 56789,
      response: draftAdjudication(returnedReport, 2),
    })
    cy.task('stubGetLocation', {})

    cy.task('stubGetDpsLocationId', {})

    cy.task('stubGetDraftAdjudication', {
      id: 1,
      response: draftAdjudication(awaitingReviewReport, 1),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 2,
      response: draftAdjudication(returnedReport, 2),
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
      response: testData.userFromUsername(),
    })
    cy.task('stubUpdateAdjudicationStatus', {
      chargeNumber: '12345',
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  describe('report AWAITING REVIEW', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('not.exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('not.exist')
      prisonerReportPage.reviewerPanel().should('exist')
    })
    it('should contain the correct review summary', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Awaiting review')

      prisonerReportPage.reviewSummary().should('not.exist')
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
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
        .reportDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain("Report on someone's behalf")
          expect($summaryData.get(2).innerText).to.contain('9 December 2022')
          expect($summaryData.get(3).innerText).to.contain('10:30')
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
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
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
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      cy.get('h1').should('contain.text', '12345')
    })
    it('should not show a link to the edit incident details page', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
    })
    it('should show a link to the offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.offenceDetailsChangeLink().should('exist')
    })
    it('should not show a link to edit the incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
    it('should go to /all-completed-reports if the exit button is pressed', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewExit().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      })
    })
    it('should go to the confirmation page if status is accepted and save is pressed and form is valid', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewStatus().find('input[value="accepted"]').check()
      prisonerReportPage.acceptedRejectDetail().should('exist')
      prisonerReportPage.reviewSubmit().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.acceptedReportConfirmation.urls.start('12345'))
      })
    })
    it('should go to /all-completed-reports if status is rejected and save is pressed and form is valid', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewStatus().find('input[value="rejected"]').check()
      prisonerReportPage.reviewRejectReason().select('expired')
      prisonerReportPage.reviewRejectDetail().type('123')
      prisonerReportPage.reviewSubmit().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      })
    })
    it('should go to /all-completed-reports if status is returned and save is pressed and form is valid', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewStatus().find('input[value="returned"]').check()
      prisonerReportPage.reviewReportReason().select('offence')
      prisonerReportPage.reviewReportDetail().type('123')
      prisonerReportPage.reviewSubmit().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      })
    })
    it('should display an error if no status is selected and save is pressed', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewSubmit().click()
      cy.get('*[class^="govuk-error-message"]').contains('Enter a review outcome')
    })

    it('should display an error if rejected is selected without a reason and save is pressed', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewStatus().find('input[value="rejected"]').check()
      prisonerReportPage.reviewSubmit().click()
      cy.get('*[class^="govuk-error-message"]').contains('Enter a reason')
    })
    it('should display an error if returned is selected without a reason and save is pressed', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewStatus().find('input[value="returned"]').check()
      prisonerReportPage.reviewSubmit().click()
      cy.get('*[class^="govuk-error-message"]').contains('Enter a reason')
    })
  })
  describe('report RETURNED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('not.exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
      prisonerReportPage.reviewerPanel().should('exist')
    })
    it('should contain the correct review summary', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
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
          expect($summaryData.get(1).innerText).to.contain('Incorrect offence chosen')
          expect($summaryData.get(2).innerText).to.contain('I think this is the incorrect offence')
        })
    })
    it('should not give the option to return an already returned adjudication', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewerPanel().should('exist')
      prisonerReportPage.reviewStatus().find('input[value="returned"]').should('not.exist')
    })
    it('should only show offences, damages, evidence and witnesses change links', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('exist')
      prisonerReportPage.evidenceChangeLink().should('exist')
      prisonerReportPage.witnessesChangeLink().should('exist')
      prisonerReportPage.offenceDetailsChangeLink().should('exist')
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
  })
  describe('report REJECTED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('not.exist')
      prisonerReportPage.printLink().should('not.exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.returnLink().contains('Return to all completed reports')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('not.exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should contain the correct review summary', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
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
          expect($summaryData.get(1).innerText).to.contain('Not suitable for an adjudication')
          expect($summaryData.get(2).innerText).to.contain('This is not worthy of an adjudication')
        })
    })
    it('should not have any change links present', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
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
