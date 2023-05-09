import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'

const testData = new TestData()
context('Add a new punishment', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.submitButton().should('exist')
      punishmentPage.cancelButton().should('exist')
      punishmentPage.punishment().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
  })

  describe('Validation', () => {
    it('should error when no punishment type selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the type of punishment')
        })
    })
    it('should error when no privilege type selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the type of privilege')
        })
    })
    it('should error when no other privilege selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter a privilege to be withdrawn')
        })
    })
    it('should error when no  stoppage percentage selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the percentage of earnings to be stopped')
        })
    })
  })

  describe('Submit', () => {
    it('should submit successfully and redirect for type CONFINEMENT', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start(100))
      })
    })

    it('should submit successfully and redirect for type EARNINGS', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.stoppagePercentage().type('10')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start(100))
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start(100))
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('nintendo switch')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start(100))
      })
    })
  })
})
