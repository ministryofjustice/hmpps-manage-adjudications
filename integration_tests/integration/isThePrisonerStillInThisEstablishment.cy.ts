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
    isThePrisonerStillInThisEstablishmentPage.radios().should('exist')
    isThePrisonerStillInThisEstablishmentPage.submitButton().should('exist')
  })
  it('should should go to normal search page if yes is selected', () => {
    cy.visit(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
    const isThePrisonerStillInThisEstablishmentPage: IsThePrisonerStillInThisEstablishmentPage = Page.verifyOnPage(
      IsThePrisonerStillInThisEstablishmentPage
    )
    isThePrisonerStillInThisEstablishmentPage.checkOnPage()
    isThePrisonerStillInThisEstablishmentPage.radioYes().click()
    isThePrisonerStillInThisEstablishmentPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.searchForPrisoner.root)
    })
  })
  it('should should go to normal search page with transfer query if no is selected', () => {
    cy.visit(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
    const isThePrisonerStillInThisEstablishmentPage: IsThePrisonerStillInThisEstablishmentPage = Page.verifyOnPage(
      IsThePrisonerStillInThisEstablishmentPage
    )
    isThePrisonerStillInThisEstablishmentPage.checkOnPage()
    isThePrisonerStillInThisEstablishmentPage.radioNo().click()
    isThePrisonerStillInThisEstablishmentPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.searchForPrisoner.root)
      expect(loc.search).to.eq('?transfer=true')
    })
  })
})
