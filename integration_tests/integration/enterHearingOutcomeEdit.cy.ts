import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import EnterHearingOutcomePage from '../pages/enterHearingOutcome'
import TestData from '../../server/routes/testutils/testData'
import { OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'
import { OicHearingType } from '../../server/data/ReportedAdjudicationResult'
import SelectAssociatedStaff from '../pages/selectAssociatedStaff'

const testData = new TestData()
context('Enter hearing outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'JBLACK_GEN',
      response: testData.userFromUsername('JBLACK_GEN', 'John Black'),
    })
    cy.task('stubGetUserFromNames', {
      staffFirstName: 'John',
      staffLastName: 'Black',
      response: [testData.staffFromName('MDI', 'JBLACK_GEN', 'John Black')],
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUserFromUsername', {
      username: 'JSMITH_GEN',
      response: testData.userFromUsername('JSMITH_GEN', 'Jennifer Smith'),
    })
    cy.task('stubGetEmail', {
      username: 'JSMITH_GEN',
      response: testData.emailFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'JBLACK_GEN',
      response: testData.emailFromUsername('JBLACK_GEN'),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-01-23T17:00:00',
                id: 68,
                locationId: 775,
                outcome: testData.hearingOutcome({
                  adjudicator: 'JSMITH_GEN',
                  optionalItems: { details: 'A reason for referral' },
                }),
              }),
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6123VU',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-01-23T17:00:00',
                id: 68,
                locationId: 775,
                oicHearingType: OicHearingType.INAD_ADULT,
                outcome: testData.hearingOutcome({
                  adjudicator: 'Jennifer Smith',
                  optionalItems: { details: 'A reason for referral' },
                }),
              }),
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements - gov hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().should('not.exist')
      enterHearingOutcomePage.searchButton().should('not.exist')
      enterHearingOutcomePage.inAdName().should('not.exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
      enterHearingOutcomePage.chosenGovernorName().should('exist')
      enterHearingOutcomePage.chosenGovernorId().should('exist')
    })
    it('should contain the required page elements - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('101'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().should('not.exist')
      enterHearingOutcomePage.searchButton().should('not.exist')
      enterHearingOutcomePage.inAdName().should('exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
    })
    it('should contain the adjudicator name and next step from API call - gov hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.chosenGovernorName().contains('Jennifer Smith')
      enterHearingOutcomePage.chosenGovernorId().contains('JSMITH_GEN')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').should('be.checked')
    })
    it('should contain the adjudicator name and next step from API call - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('101'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().should('have.value', 'Jennifer Smith')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').should('be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the correct endpoint after submission if the adjudicators name is changed, query values updated - gov hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.deleteButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
        expect(loc.search).to.eq('')
      })
      enterHearingOutcomePage.governorName().type('John Black')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JBLACK_GEN').click()
      enterHearingOutcomePage.chosenGovernorName().contains('John Black')
      enterHearingOutcomePage.chosenGovernorId().contains('JBLACK_GEN')
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit('100'))
        expect(loc.search).to.eq('?adjudicator=JBLACK_GEN&hearingOutcome=REFER_POLICE')
      })
    })
    it('goes to the correct endpoint after submission if the adjudicators name is changed, query values updated - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('101'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().clear()
      enterHearingOutcomePage.inAdName().type('Judge Blue')
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit('101'))
        expect(loc.search).to.eq('?adjudicator=Judge%20Blue&hearingOutcome=REFER_POLICE')
      })
    })
    it('goes to correct endpoint if the radio button is changed, query values updated', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit('100'))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=REFER_INAD')
      })
    })
    it('goes to correct endpoint even if no changes are made, query values maintained', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit('100'))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=REFER_POLICE')
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if adjudicator name is missing - independent adjudicator hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('101'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().clear()
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the name of the adjudicator')
        })
    })
    it('shows correct error message if adjudicator name is missing - governor hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.deleteButton().click()
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Search for a governor')
        })
    })
  })
})
