import adjudicationUrls from '../../server/utils/urlGenerator'
import HomepagePage from '../pages/home'
import Page from '../pages/page'

context('Home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should see the feedback banner', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepageMockup: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepageMockup.feedbackBanner().should('exist')
  })

  it('should only see some tiles without the reviewer role', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepageMockup: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepageMockup.feedbackBanner().should('exist')
    homepageMockup.startANewReportLink().should('exist')
    homepageMockup.continueAReportLink().should('exist')
    homepageMockup.viewYourCompletedReportsLink().should('exist')
    homepageMockup.viewAllCompletedReportsLink().should('not.exist')
  })

  it('should see all the tiles with the reviewer role', () => {
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepageMockup: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepageMockup.feedbackBanner().should('exist')
    homepageMockup.startANewReportLink().should('exist')
    homepageMockup.continueAReportLink().should('exist')
    homepageMockup.viewYourCompletedReportsLink().should('exist')
    homepageMockup.viewAllCompletedReportsLink().should('exist')
  })
})
