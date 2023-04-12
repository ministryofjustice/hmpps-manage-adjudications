import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import AwardPunishmentsPage from '../pages/awardPunishments'
import PunishmentSchedulePage from '../pages/punishmentSchedule'
import { forceDateInput } from '../componentDrivers/dateInput'

const testData = new TestData()
context('e2e tests to create and edit punishments and schedules with redis', () => {
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
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: {
          ...testData.reportedAdjudication({
            punishments: [],
            adjudicationNumber: 3,
            prisonerNumber: 'G6415GD',
            locationId: 25538,
            offenceDetails: { offenceCode: 1001 },
          }),
          bookingId: 123,
        },
      },
    })
  })

  describe('e2e', () => {
    it('create and edit punishments - CONFINEMENT', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(100))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').should('be.checked')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - EARNINGS', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(100))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.stoppagePercentage().type('10')
      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="no"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      forceDateInput(20, 10, 2030, '[data-qa="end-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="EARNINGS"]').should('be.checked')
      punishmentPage.stoppagePercentage().should('have.value', '10')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="no"]').should('be.checked')
      punishmentSchedulePage.startDate().should('have.value', '10/10/2030')
      punishmentSchedulePage.endDate().should('have.value', '20/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(100))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').should('be.checked')
      punishmentPage.privilege().find('input[value="CANTEEN"]').should('be.checked')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(100))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('nintendo switch')

      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').should('be.checked')
      punishmentPage.privilege().find('input[value="OTHER"]').should('be.checked')
      punishmentPage.otherPrivilege().should('have.value', 'nintendo switch')

      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - PROSPECTIVE DAYS', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(100))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PROSPECTIVE_DAYS"]').check()

      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.suspended().should('exist')
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="no"]').click()

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="PROSPECTIVE_DAYS"]').should('be.checked')

      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')

      punishmentSchedulePage.submitButton().click()
    })
  })
})
