import SelectAssociatedStaff from '../pages/selectAssociatedStaff'
import OffenceCodeSelection from '../pages/offenceCodeSelection'

import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()

context('Select associated staff', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    // Committed draft
    cy.task('stubGetDraftAdjudication', {
      id: 100,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 100,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
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
      response: testData.emailFromUsername(),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
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
    cy.signIn()
  })
  it('should contain the required page elements - original page: offence code decisions', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-3').check()
    whoWasAssaultedPage.victimStaffSearchNameInput().type('John Smith')
    whoWasAssaultedPage.searchStaff().click()
    const selectAssociatedStaffPage: SelectAssociatedStaff = Page.verifyOnPage(SelectAssociatedStaff)
    selectAssociatedStaffPage.nameInput().should('exist')
    selectAssociatedStaffPage.resultsTable().should('exist')
    selectAssociatedStaffPage.noResultsMessage().should('not.exist')
    selectAssociatedStaffPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Name')
        expect($headings.get(1).innerText).to.contain('Location')
        expect($headings.get(2).innerText).to.contain('User ID')
        expect($headings.get(3).innerText).to.contain('Email address')
      })

    selectAssociatedStaffPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('John Smith')
        expect($data.get(1).innerText).to.contain('Moorland (HMP & YOI)')
        expect($data.get(2).innerText).to.contain('JSMITH_GEN')
        expect($data.get(3).innerText).to.contain('john.smith@digital.justice.gov.uk')
        expect($data.get(4).innerText).to.contain('Select John Smith')
      })
  })
  it('contains the requires elements - original page: enter hearing outcome', () => {
    cy.visit(adjudicationUrls.enterHearingOutcome.urls.start('100'))
    cy.get('#governorName').type('John Smith')
    cy.get('[data-qa="gov-search"]').click()
    const SelectStaffMemberPage = new SelectAssociatedStaff()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=John%20Smith`)
    SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
    cy.url().should('include', `${adjudicationUrls.enterHearingOutcome.urls.start('100')}?selectedPerson=JSMITH_GEN`)
  })
  it('returns to the previous page with the selected staff member details', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-3').check()
    whoWasAssaultedPage.victimStaffSearchNameInput().type('John Smith')
    whoWasAssaultedPage.searchStaff().click()
    const SelectStaffMemberPage = new SelectAssociatedStaff()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=John%20Smith`)
    SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
    cy.url().should(
      'include',
      `${adjudicationUrls.offenceCodeSelection.urls.question(
        100,
        'committed',
        '1-1-1',
      )}?selectedAnswerId=1-1-1-3&selectedPerson=JSMITH_GEN`,
    )
  })
})
