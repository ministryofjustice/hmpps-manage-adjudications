import HomepagePage from '../pages/home'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import { homepage } from '../../server/utils/urlGenerator'

context('Sign in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit(homepage.root)
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const homePageMockup: HomepagePage = Page.verifyOnPage(HomepagePage)
    homePageMockup.signInName().contains('J. Smith')
    homePageMockup.activeLocation().contains('Moorland')
  })

  it('User can log out', () => {
    cy.signIn()
    const homePageMockup: HomepagePage = Page.verifyOnPage(HomepagePage)
    homePageMockup.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
