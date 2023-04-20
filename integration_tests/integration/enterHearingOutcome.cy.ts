import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import EnterHearingOutcomePage from '../pages/enterHearingOutcome'
import SelectAssociatedStaff from '../pages/selectAssociatedStaff'

import TestData from '../../server/routes/testutils/testData'
import { OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Enter hearing outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    // Staff Member
    cy.task('stubGetUserFromNames', {
      staffFirstName: 'John',
      staffLastName: 'Smith',
      response: [testData.staffFromName()],
    })
    // Staff Member
    cy.task('stubGetUserFromUsername', {
      username: 'JSMITH_GEN',
      response: testData.userFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'JSMITH_GEN',
      response: testData.emailFromUsername('JSMITH_GEN'),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-01-04T09:00:00',
                id: 987,
                locationId: 123,
              }),
            },
          ] as OutcomeHistory,
          status: ReportedAdjudicationStatus.SCHEDULED,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 101,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-01-04T09:00:00',
                id: 987,
                locationId: 123,
                oicHearingType: OicHearingType.INAD_ADULT,
              }),
            },
          ] as OutcomeHistory,
          status: ReportedAdjudicationStatus.SCHEDULED,
        }),
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements - governor hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().should('exist')
      enterHearingOutcomePage.searchButton().should('exist')
      enterHearingOutcomePage.inAdName().should('not.exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
    })
    it('should contain the required page elements - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().should('not.exist')
      enterHearingOutcomePage.inAdName().should('exist')
      enterHearingOutcomePage.searchButton().should('not.exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully - gov hearing', () => {
    it('goes to referral reason if police referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').check()
      enterHearingOutcomePage.chosenGovernorName().contains('Test User')
      enterHearingOutcomePage.chosenGovernorId().contains('JSMITH_GEN')
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=REFER_POLICE')
      })
    })
    it('goes to referral reason if independent adjudicator referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=REFER_INAD')
      })
    })
    it('goes to plea and finding if hearing complete selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.radioButtons().find('input[value="COMPLETE"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=COMPLETE')
      })
    })
    it('goes to reason for adjournment if adjourned selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingAdjourned.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=ADJOURN')
      })
    })
  })
  describe('Submits successfully - independent adjudicator hearing', () => {
    it('goes to referral reason if police referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(101))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcome=REFER_POLICE')
      })
    })
    it('goes to referral reason if independent adjudicator referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(101))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcome=REFER_INAD')
      })
    })
    it('goes to plea and finding if hearing complete selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="COMPLETE"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingPleaAndFinding.urls.start(101))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcome=COMPLETE')
      })
    })
    it('goes to reason for adjournment if adjourned selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingAdjourned.urls.start(101))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcome=ADJOURN')
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if hearing outcome missing - gov hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step after this hearing')
        })
    })
    it('shows correct error message if hearing outcome missing - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('Roxanne Red')
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step after this hearing')
        })
    })
    it('shows correct error message if adjuicator name is missing - governor - name not entered', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Search for a governor')
        })
    })
    it('shows correct error message if adjuicator name is missing - governor - search not performed', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Search for a governor')
        })
    })
    it('shows correct error message if adjuicator name is missing - independent adjudicator', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(101))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the name of the adjudicator')
        })
    })
  })
})
