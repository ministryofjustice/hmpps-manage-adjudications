import ReviewerEditOffencesWarningPage from '../pages/reviewerEditOffencesWarning'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()

const createDraftFromReportedAdjudicationResponse = (adjudicationNumber: number, id: number) => {
  return {
    draftAdjudication: testData.draftAdjudication({
      id,
      adjudicationNumber,
      locationId: 25538,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-01T09:40:00',
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
  }
}

const reportedAdjudicationResponse = (adjudicationNumber: number, status: ReportedAdjudicationStatus) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      locationId: 25538,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      dateTimeOfDiscovery: '2021-12-10T09:40:00',
      status,
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
  }
}

context('Warning - reviewer edits offence', () => {
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
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: createDraftFromReportedAdjudicationResponse(12345, 177),
    })

    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: reportedAdjudicationResponse(12345, ReportedAdjudicationStatus.AWAITING_REVIEW),
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
    return cy.signIn()
  })
  describe('warning page', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reviewerEditOffenceWarning.urls.start(12345))
      const warningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
      warningPage.paragraph1().should('exist')
      warningPage.paragraph2().should('exist')
      warningPage.offenceDetailsSummary().should('exist')
      warningPage.continueButton().should('exist')
      warningPage.cancelButton().should('exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.reviewerEditOffenceWarning.urls.start(12345))
      const warningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
      warningPage
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
      warningPage
        .offenceDetailsSummary()
        .find('dd')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($data.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($data.get(2).innerText).to.contain('Assaulting someone')
          expect($data.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($data.get(4).innerText).to.contain('Yes')
          expect($data.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('contains the correct paragraph content', () => {
      cy.visit(adjudicationUrls.reviewerEditOffenceWarning.urls.start(12345))
      const warningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
      warningPage.paragraph1().should('contain.text', 'If you change the offence, you’ll delete the information below.')
      warningPage
        .paragraph2()
        .should('contain.text', 'Before changing it, make a note of any information you might need to re-enter later.')
    })
    it('clicking cancel button takes you to the original report', () => {
      cy.visit(adjudicationUrls.reviewerEditOffenceWarning.urls.start(12345))
      const warningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
      warningPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(12345))
      })
    })
    it('clicking continue button takes you to the age of prisoner page with new draft Id', () => {
      cy.visit(adjudicationUrls.reviewerEditOffenceWarning.urls.start(12345))
      const warningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
      warningPage.continueButton().click()
      cy.location().should(loc => {
        // Needs to go to the submitted edit with reselect eq to true, but need to split this up for the test
        expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(177))
        expect(loc.search).to.eq('?reselectingFirstOffence=true')
      })
    })
  })
})
