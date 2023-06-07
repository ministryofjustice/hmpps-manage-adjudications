import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import IsThePrisonerStillInThisEstablishmentPage from '../pages/isThePrisonerStillInThisEstablishment'

context('Is the prisoner still in this establishment?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
    const isThePrisonerStillInThisEstablishmentPage: IsThePrisonerStillInThisEstablishmentPage = Page.verifyOnPage(
      IsThePrisonerStillInThisEstablishmentPage
    )
    isThePrisonerStillInThisEstablishmentPage.checkOnPage()
  })
})
