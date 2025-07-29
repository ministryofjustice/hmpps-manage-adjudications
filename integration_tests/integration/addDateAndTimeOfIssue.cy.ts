import Page from '../pages/page'
import AddDateAndTimeOfIssue from '../pages/addDateAndTimeOfIssue'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()

context('Add date and time', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.addIssueDateTime.urls.start('12345'))
    const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
    addDateTimeOfIssuePage.errorSummary().should('not.exist')
    addDateTimeOfIssuePage.hintText().should('exist')
    addDateTimeOfIssuePage.dateInput().should('exist')
    addDateTimeOfIssuePage.hourInput().should('exist')
    addDateTimeOfIssuePage.minutesInput().should('exist')
    addDateTimeOfIssuePage.submitButton().should('exist')
    addDateTimeOfIssuePage.cancelButton().should('exist')
  })
  it('should redirect to the confirm form issue page on successful submit', () => {
    cy.task('stubPutDateTimeOfIssue', {
      chargeNumber: '12345',
      response: testData.reportedAdjudication({ chargeNumber: '12345', prisonerNumber: 'G6123VU' }),
    })
    const date = new Date()
    const yesterday = formatDateForDatePicker(new Date(date.setDate(date.getDate() - 1)).toISOString(), 'short')
    cy.visit(
      `${adjudicationUrls.addIssueDateTime.urls.start(
        '12345',
      )}?referrer=${adjudicationUrls.confirmDISFormsIssued.urls.start()}`,
    )
    const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
    addDateTimeOfIssuePage.dateInput().type(yesterday)
    addDateTimeOfIssuePage.hourInput().type('20')
    addDateTimeOfIssuePage.minutesInput().type('30')
    addDateTimeOfIssuePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.urls.start())
    })
  })
  it('should redirect to the confirm form issue page on cancel', () => {
    cy.visit(adjudicationUrls.addIssueDateTime.urls.start('12345'))
    const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
    addDateTimeOfIssuePage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.urls.start())
    })
  })
  it('should show a validation message if no date is entered', () => {
    cy.visit(adjudicationUrls.addIssueDateTime.urls.start('12345'))
    const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
    addDateTimeOfIssuePage.hourInput().type('09')
    addDateTimeOfIssuePage.minutesInput().type('30')
    addDateTimeOfIssuePage.submitButton().click()
    addDateTimeOfIssuePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter date of issue')
      })
  })
  it('should show a validation message if no time is entered', () => {
    const today = formatDateForDatePicker(new Date().toISOString(), 'short')
    cy.visit(adjudicationUrls.addIssueDateTime.urls.start('12345'))
    const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
    addDateTimeOfIssuePage.dateInput().type(today)
    addDateTimeOfIssuePage.submitButton().click()
    addDateTimeOfIssuePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter time of issue')
      })
  })
})
