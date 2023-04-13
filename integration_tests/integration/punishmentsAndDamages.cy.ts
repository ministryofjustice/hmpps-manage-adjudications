import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()
context('Damages and punishments summary', () => {
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 99,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 99,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  amount: 100.5,
                  caution: true,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 14,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.OTHER,
              otherPrivilege: 'chocolate',
              schedule: {
                days: 10,
                startDate: '2023-04-10',
                endDate: '2023-04-20',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  amount: 100.5,
                  caution: true,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 101,
          status: ReportedAdjudicationStatus.SCHEDULED,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 102,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 102,
          status: ReportedAdjudicationStatus.QUASHED,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  amount: 100.5,
                  caution: true,
                }),
              },
            },
          ],
        }),
      },
    })
  })

  describe('Loads', () => {
    it('should contain the required page elements - status not `charge proved`', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(101))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.moneyCautionSummary().should('not.exist')
      punishmentsAndDamagesPage.quashedWarning().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('not.exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      punishmentsAndDamagesPage
        .noPunishments()
        .contains('There are no punishments added. You can only add punishments if the charge is proved.')
    })
    it('should contain the required page elements - status `quashed`', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(102))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .quashedWarning()
        .contains('The guilty finding has been quashed. Punishments and recovery of damages should not be enforced.')
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      // punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      punishmentsAndDamagesPage.noPunishments().should('not.exist')
    })
    it('should contain the required page elements - charge proved, no punishments', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.punishmentsTabName().contains('Punishments and damages')

      punishmentsAndDamagesPage
        .moneyCautionSummary()
        .find('dt')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Is any money being recovered for damages?')
          expect($summaryData.get(1).innerText).to.contain('Is the punishment a caution?')
        })
      punishmentsAndDamagesPage
        .moneyCautionSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
          expect($summaryData.get(2).innerText).to.contain('Yes')
        })
      punishmentsAndDamagesPage.quashedWarning().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('not.exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('exist')
    })
    it('should contain the required page elements - charge proved, punishments present', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.quashedWarning().should('not.exist')
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.noPunishments().should('not.exist')
    })
  })

  describe('links', () => {
    it('should got to money recovered edit', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      cy.get('[data-qa="change-link"').first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.moneyRecoveredForDamages.urls.edit(100))
      })
    })
    it('should got to is caution edit', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      cy.get('[data-qa="change-link"').eq(1).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.edit(100))
      })
    })
    it('change punishments goes to award punishments page', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.changePunishmentsButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.start(99))
      })
    })
    it('report quashed goes to quash page', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.reportQuashedButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start(99))
      })
    })
    it('award punishments goes to award punishments', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.awardPunishmentsButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.start(100))
      })
    })
  })
})
