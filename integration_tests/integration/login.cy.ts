import HomepagePage from '../pages/home'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

context('Sign in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit(adjudicationUrls.homepage.root)
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can log out', () => {
    cy.signIn()
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
