import Homepage from '../pages/home'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import { homepageUrl } from '../../server/utils/urlGenerator'

context('Sign in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit(homepageUrl.root)
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const homePage: Homepage = Page.verifyOnPage(Homepage)
    homePage.signInName().contains('J. Smith')
    homePage.activeLocation().contains('Moorland')
  })

  it('User can log out', () => {
    cy.signIn()
    const homePage: Homepage = Page.verifyOnPage(Homepage)
    homePage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
