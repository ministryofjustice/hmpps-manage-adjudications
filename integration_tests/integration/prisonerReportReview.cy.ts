import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()

const reportedAdjudication = (
  status: ReportedAdjudicationStatus,
  reviewedByUserId = null,
  statusReason = null,
  statusDetails = null
) => {
  return testData.reportedAdjudication({
    adjudicationNumber: 1524493,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-12-09T10:30:00',
    status,
    otherData: {
      reviewedByUserId,
      statusReason,
      statusDetails,
    },
  })
}

const draftAdjudication = (adjudicationNumber: number) => {
  return testData.draftAdjudication({
    id: 177,
    adjudicationNumber,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-12-01T09:40:00',
  })
}

context('Prisoner report - reviewer view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
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
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: reportedAdjudication(ReportedAdjudicationStatus.AWAITING_REVIEW),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: {
        reportedAdjudication: reportedAdjudication(
          ReportedAdjudicationStatus.RETURNED,
          'USER1',
          'offence',
          'I think this is the incorrect offence'
        ),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456790,
      response: {
        reportedAdjudication: reportedAdjudication(ReportedAdjudicationStatus.ACCEPTED, 'USER1'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456791,
      response: {
        reportedAdjudication: reportedAdjudication(ReportedAdjudicationStatus.SCHEDULED, 'USER1'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456789,
      response: {
        reportedAdjudication: reportedAdjudication(ReportedAdjudicationStatus.UNSCHEDULED, 'USER1'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 356789,
      response: {
        reportedAdjudication: reportedAdjudication(
          ReportedAdjudicationStatus.REJECTED,
          'USER1',
          'unsuitable',
          'This is not worthy of an adjudication'
        ),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: {
        draftAdjudication: draftAdjudication(12345),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 56789,
      response: {
        draftAdjudication: draftAdjudication(56789),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 356789,
      response: {
        draftAdjudication: draftAdjudication(356789),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 456789,
      response: {
        draftAdjudication: draftAdjudication(456789),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 456790,
      response: {
        draftAdjudication: draftAdjudication(456790),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 456791,
      response: {
        draftAdjudication: draftAdjudication(456791),
      },
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
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          locationId: 25538,
          dateTimeOfIncident: '2021-12-01T09:40:00',
          dateTimeOfDiscovery: '2021-12-02T03:04:05',
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
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
          offenceDetails: {
            offenceCode: 1001,
            offenceRule: {
              paragraphNumber: '1',
              paragraphDescription: 'Commits any assault',
            },
            victimPrisonersNumber: 'G5512G',
          },
        }),
      },
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
      adjudicationNumber: 12345,
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    prisonerReportPage.reviewSummaryTitle().should('exist')
    prisonerReportPage.reviewSummary().should('not.exist')
    prisonerReportPage.incidentDetailsSummary().should('exist')
    prisonerReportPage.offenceDetailsSummary().should('exist')
    prisonerReportPage.incidentStatement().should('exist')
    prisonerReportPage.reportNumber().should('exist')
    prisonerReportPage.reviewerPanel().should('exist')
  })
  it('should contain the correct review summary - returned', () => {
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
  it('should contain the correct review summary - rejected', () => {
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
  it('should contain the correct review summary - unscheduled', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Unscheduled')

    prisonerReportPage
      .reviewSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
      })

    prisonerReportPage
      .reviewSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
      })
  })
  it('should contain the correct review summary - accepted', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456790))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Accepted')

    prisonerReportPage
      .reviewSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
      })

    prisonerReportPage
      .reviewSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
      })
  })
  it('should contain the correct review summary - scheduled', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Scheduled')

    prisonerReportPage
      .reviewSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
      })

    prisonerReportPage
      .reviewSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
      })
  })
  it('should contain the correct review summary - awaiting review', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Awaiting review')

    prisonerReportPage.reviewSummary().should('not.exist')
  })
  it('should contain the correct incident details', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    prisonerReportPage
      .incidentDetailsSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
        expect($summaryLabels.get(1).innerText).to.contain('Date of incident')
        expect($summaryLabels.get(2).innerText).to.contain('Time of incident')
        expect($summaryLabels.get(3).innerText).to.contain('Location')
        expect($summaryLabels.get(4).innerText).to.contain('Date of discovery')
        expect($summaryLabels.get(5).innerText).to.contain('Time of discovery')
      })

    prisonerReportPage
      .incidentDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
        expect($summaryData.get(1).innerText).to.contain('1 December 2021')
        expect($summaryData.get(2).innerText).to.contain('09:40')
        expect($summaryData.get(3).innerText).to.contain('Houseblock 1')
        expect($summaryData.get(4).innerText).to.contain('2 December 2021')
        expect($summaryData.get(5).innerText).to.contain('03:04')
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
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    prisonerReportPage.reportNumber().should('contain.text', '12345')
  })
  it('should not show a link to the edit incident details page', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
  })
  it('should not show a link to the incident details page', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
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
      expect(loc.pathname).to.eq(adjudicationUrls.acceptedReportConfirmation.urls.start(12345))
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
  it('should not contain the hearings tab if status is REJECTED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.hearingsTab().should('not.exist')
  })
  it('should contain the review panel if status is RETURNED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewerPanel().should('exist')
    prisonerReportPage.reviewStatus().find('input[value="returned"]').should('not.exist')
  })
  it('should not contain the review panel if status is REJECTED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewerPanel().should('not.exist')
  })
  it('should not contain the review panel if status is ACCEPTED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456790))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewerPanel().should('not.exist')
  })
  it('should not contain the review panel if status is UNSCHEDULED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewerPanel().should('not.exist')
  })
  it('should not contain the review panel if status is SCHEDULED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.reviewerPanel().should('not.exist')
  })
})
