import HomePage from '../pages/homePage'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.signInName().contains('J. Smith')
    homePage.activeLocation().contains('Moorland')
  })

  it('User can log out', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
