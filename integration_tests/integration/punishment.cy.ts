import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

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
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 60,
              oicHearingType: OicHearingType.INAD_YOI,
            }),
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.submitButton().should('exist')
      punishmentPage.cancelButton().should('exist')
      punishmentPage.punishment().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
    it('should show additional days and prospective additional days radios if the hearing is IA', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('101'))
      cy.get('#punishmentType-8').should('exist')
      cy.get('[for="punishmentType-8"]').should('include.text', 'Additional days')
      cy.get('#punishmentType-9').should('exist')
      cy.get('[for="punishmentType-9"]').should('include.text', 'Prospective additional days')
    })
    // TODO: activate with v2EndpointsFlag (and delete above)
    it.skip('should show additional days and prospective additional days radios if the hearing is IA', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('101'))
      cy.get('#punishmentType-10').should('exist')
      cy.get('[for="punishmentType-10"]').should('include.text', 'Additional days')
      cy.get('#punishmentType-11').should('exist')
      cy.get('[for="punishmentType-11"]').should('include.text', 'Prospective additional days')
    })
    // TODO: activate with v2EndpointsFlag
    it.skip('should contain caution and damages radio buttons', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('101'))
      cy.get('#punishmentType').should('exist')
      cy.get('[for="punishmentType"]').should('include.text', 'Recovery of money for damages')
      cy.get('#punishmentType-2').should('exist')
      cy.get('[for="punishmentType-2"]').should('include.text', 'Caution')
    })
  })

  describe('Validation', () => {
    it('should error when no punishment type selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the type of punishment')
        })
    })
    // TODO: activate with v2EndpointsFlag (and delete above)
    it.skip('should error when no punishment type selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a punishment or recovery of money for damages')
        })
    })
    it('should error when no privilege type selected', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
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
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
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
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
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
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start('100'))
      })
    })

    it('should submit successfully and redirect for type EARNINGS', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.stoppagePercentage().type('10')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start('100'))
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start('100'))
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('nintendo switch')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSchedule.urls.start('100'))
      })
    })
  })
})
