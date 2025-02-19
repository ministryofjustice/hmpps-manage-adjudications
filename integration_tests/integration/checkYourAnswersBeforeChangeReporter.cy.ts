import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CheckYourAnswers from '../pages/checkYourAnswersBeforeChangeReporter'
import Page from '../pages/page'

const testData = new TestData()

const completeDraftAdjudicationResponse = (isYouthOffender: boolean) => {
  return {
    draftAdjudication: testData.draftAdjudication({
      id: 3456,
      chargeNumber: '234',
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-11-03T11:09:42',
      locationId: 234,
      incidentStatement: {
        statement: 'This is my statement',
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
      isYouthOffender,
    }),
  }
}

const submitCompleteDraftResponse = {
  chargeNumber: '234',
}

const completeReportedAdjudicationResponse = (
  status = null,
  reviewedByUserId = null,
  statusReason = null,
  statusDetails = null
) => {
  return {
    reportedAdjudication: {
      chargeNumber: '234',
      status,
      reviewedByUserId,
      statusReason,
      statusDetails,
    },
  }
}

context('Check Your Answers Before Changing Reporter', () => {
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
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'James',
        lastName: 'Jones',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'Paul',
        lastName: 'Wright',
      }),
    })
    cy.task('stubGetLocations', {
      prisonId: 'MDI',
      response: [
        {
          id: 'location-1',
          prisonId: 'MDI',
          key: 'MDI-1',
          localName: 'Workshop 19 - Braille',
        },
      ],
    })

    cy.task('stubGetDpsLocationId', {
      nomisLocationId: 234,
      response: {
        nomisLocationId: 234,
        dpsLocationId: 'location-1',
      },
    })

    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 234,
      response: completeReportedAdjudicationResponse('RETURNED', 'USER1', 'offence', 'wrong'),
    })
  })
  context('YOI offences', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: completeDraftAdjudicationResponse(true),
      })
      cy.task('stubSubmitCompleteDraftAdjudication', {
        id: 3456,
        response: submitCompleteDraftResponse,
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage.genderDetailsSummary().should('not.exist')
      checkYourAnswersPage.reviewStatus().should('exist')
      checkYourAnswersPage.reviewSummary().should('exist')
      checkYourAnswersPage.incidentDetailsSummary().should('exist')
      checkYourAnswersPage.incidentStatement().should('exist')
      checkYourAnswersPage.submitButton().should('exist')
      checkYourAnswersPage.submitButton().contains('Confirm changes')
      checkYourAnswersPage.exitButton().should('exist')
      checkYourAnswersPage.exitButton().contains('Cancel')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.reviewStatus().should('contain.text', 'Status: Returned')
      checkYourAnswersPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
          expect($summaryLabels.get(1).innerText).to.contain('Reason for return')
          expect($summaryLabels.get(2).innerText).to.contain('Details')
        })

      checkYourAnswersPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('Incorrect offence chosen')
          expect($summaryData.get(2).innerText).to.contain('wrong')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(3).innerText).to.contain('Location')
        })

      checkYourAnswersPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain("Report on someone's behalf")
          expect($summaryData.get(2).innerText).to.contain('3 November 2021')
          expect($summaryData.get(3).innerText).to.contain('11:09')
          expect($summaryData.get(4).innerText).to.contain('Workshop 19 - Braille')
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage.incidentStatement().should('contain.text', 'This is my statement')
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
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

      checkYourAnswersPage
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
    it('should go to the completion page (changed) if the user submits changes to the report', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.confirmedOnReport.urls.confirmationOfChange('234'))
      })
    })
    it('should go to the prisoner report page if the user cancels', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(234))
      })
    })
    it('should go to the incident details page if the incident details change link is clicked', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.incidentDetailsChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 3456))
      })
    })
    it('should go to the correct page if the offence details change link is clicked - to reenter new offences', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.offenceDetailsChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
      })
    })
    it('should go to the incident statement page if the incident statement change link is clicked', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.incidentStatementChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.submittedEdit(3456))
      })
    })
  })
  context('Adult offences', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: completeDraftAdjudicationResponse(false),
      })
      cy.task('stubGetReportedAdjudication', {
        id: 234,
        response: completeReportedAdjudicationResponse('AWAITING_REVIEW'),
      })
      cy.signIn()
    })
    it('should show the correct review status', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.reviewStatus().should('exist')
      checkYourAnswersPage.reviewStatus().should('contain.text', 'Status: Awaiting review')
      checkYourAnswersPage.reviewSummary().should('not.exist')
    })
    it('should show the correct prison rule', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.report(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
        })

      checkYourAnswersPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
  })
})
