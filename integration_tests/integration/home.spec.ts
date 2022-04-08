import { homepageUrl } from '../../server/utils/urlGenerator'
import Homepage from '../pages/home'
import Page from '../pages/page'

context('Home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should see the feedback banner', () => {
    cy.visit(homepageUrl.root)
    const homepage: Homepage = Page.verifyOnPage(Homepage)
    homepage.feedbackBanner().should('exist')
  })

  it('should only see some tiles without the reviewer role', () => {
    cy.visit(homepageUrl.root)
    const homepage: Homepage = Page.verifyOnPage(Homepage)
    homepage.feedbackBanner().should('exist')
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllCompletedReportsLink().should('not.exist')
  })

  it('should see all the tiles with the reviewer role', () => {
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(homepageUrl.root)
    const homepage: Homepage = Page.verifyOnPage(Homepage)
    homepage.feedbackBanner().should('exist')
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllCompletedReportsLink().should('exist')
  })
})
