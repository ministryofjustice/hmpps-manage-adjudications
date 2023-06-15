import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import {
  HearingOutcomeCode,
  OutcomeCode,
  OutcomeHistory,
  QuashGuiltyFindingReason,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()
context('Damages and punishments summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'user1',
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
                  caution: false,
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
          punishmentComments: [testData.singlePunishmentComment({})],
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
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 103,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 103,
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
                  caution: false,
                }),
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
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
                  caution: false,
                }),
              },
            },
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  amount: 100.5,
                  caution: false,
                  quashedReason: QuashGuiltyFindingReason.JUDICIAL_REVIEW,
                }),
              },
            },
          ] as OutcomeHistory,
          punishments: [
            {
              id: 14,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.OTHER,
              otherPrivilege: 'games',
              schedule: {
                days: 10,
                startDate: '2023-04-10',
                endDate: '2023-04-20',
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 112,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 112,
          status: ReportedAdjudicationStatus.QUASHED,
          prisonerNumber: 'G6415GD',
          otherData: {
            outcomeEnteredInNomis: true,
          },
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
                  caution: false,
                }),
              },
            },
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  amount: 100.5,
                  caution: false,
                  quashedReason: QuashGuiltyFindingReason.JUDICIAL_REVIEW,
                }),
              },
            },
          ] as OutcomeHistory,
          punishments: [
            {
              id: 14,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.OTHER,
              otherPrivilege: 'games',
              schedule: {
                days: 10,
                startDate: '2023-04-10',
                endDate: '2023-04-20',
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 110,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 110,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          otherData: {
            outcomeEnteredInNomis: true,
          },
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
      id: 111,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 111,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          otherData: {
            outcomeEnteredInNomis: true,
          },
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
      // punishmentsAndDamagesPage.addPunishmentCommentButton().should('not.exist')
    })
    it('should contain the required page elements - status `quashed`', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(102))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .quashedWarning()
        .contains('The guilty finding has been quashed. Punishments and recovery of damages should not be enforced.')
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      punishmentsAndDamagesPage.noPunishments().should('not.exist')
      punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
      // punishmentsAndDamagesPage.changePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.removePunishmentCommentLink().should('exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
    })
    it('should contain the required page elements - status `quashed`', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(112))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      cy.get('[data-qa="change-link"').should('not.exist')
      punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
      // punishmentsAndDamagesPage.changePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.removePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
    })
    it('should contain the required page elements - charge proved, no punishments, caution true', () => {
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
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
      // punishmentsAndDamagesPage.changePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.removePunishmentCommentLink().should('exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
    })
    it('should not show change links, change button or quash button if outcome is entered in NOMIS flag is present', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(110))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.punishmentsTabName().contains('Punishments and damages')

      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('not.exist')
      cy.get('[data-qa="change-link"').should('not.exist')
    })
    it('should contain the required page elements - charge proved, no punishments, caution false', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(103))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .moneyCautionSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
          expect($summaryData.get(2).innerText).to.contain('No')
        })
      punishmentsAndDamagesPage.awardPunishmentsButton().should('exist')
      punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
      // punishmentsAndDamagesPage.changePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.removePunishmentCommentLink().should('exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
    })
    it('should contain the required page elements - charge proved, punishments and comments present', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.quashedWarning().should('not.exist')
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.noPunishments().should('not.exist')
      punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
      // punishmentsAndDamagesPage.changePunishmentCommentLink().should('exist')
      // punishmentsAndDamagesPage.removePunishmentCommentLink().should('exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
    })
    it('should not have any buttons or change links if outcome entered in NOMIS - charge proved, punishments present', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(111))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
      punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
      punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
      punishmentsAndDamagesPage.addPunishmentCommentButton().should('not.exist')
      cy.get('[data-qa="change-link"').should('not.exist')
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
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(103))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.awardPunishmentsButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.start(103))
      })
    })
  })
})

context('Reporter view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'user1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'NOT_A_REVIEWER' }])
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
          punishmentComments: [testData.singlePunishmentComment({})],
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
          punishmentComments: [testData.singlePunishmentComment({})],
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
                  caution: false,
                }),
              },
            },
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  amount: 100.5,
                  caution: false,
                  quashedReason: QuashGuiltyFindingReason.JUDICIAL_REVIEW,
                }),
              },
            },
          ] as OutcomeHistory,
          punishments: [
            {
              id: 14,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.OTHER,
              otherPrivilege: 'games',
              schedule: {
                days: 10,
                startDate: '2023-04-10',
                endDate: '2023-04-20',
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })
  })
  it('should contain the required page elements - status not `charge proved` - empty state', () => {
    cy.visit(adjudicationUrls.punishmentsAndDamages.urls.report(101))
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
    punishmentsAndDamagesPage.addPunishmentCommentButton().should('not.exist')
  })
  it('should contain the required page elements - status `charge proved` - no punishments', () => {
    cy.visit(adjudicationUrls.punishmentsAndDamages.urls.report(100))
    const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
    punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
    punishmentsAndDamagesPage.quashedWarning().should('not.exist')
    punishmentsAndDamagesPage.awardPunishmentsTable().should('not.exist')
    punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
    punishmentsAndDamagesPage
      .moneyCautionSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
        expect($summaryData.get(1).innerText).to.contain('Yes')
      })
    punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
    punishmentsAndDamagesPage.changePunishmentCommentLink().should('not.exist')
    punishmentsAndDamagesPage.removePunishmentCommentLink().should('not.exist')
    // punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
  })
  it('should contain the required page elements - status `charge proved` - punishments present', () => {
    cy.visit(adjudicationUrls.punishmentsAndDamages.urls.report(99))
    const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
    punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
    punishmentsAndDamagesPage.quashedWarning().should('not.exist')
    punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
    punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
    punishmentsAndDamagesPage
      .moneyCautionSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
        expect($summaryData.get(1).innerText).to.contain('Yes')
      })
    punishmentsAndDamagesPage
      .awardPunishmentsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contains('Loss of chocolate')
        expect($data.get(1).innerText).to.contains('10 Apr 2023')
        expect($data.get(2).innerText).to.contains('20 Apr 2023')
        expect($data.get(3).innerText).to.contains('10')
        expect($data.get(4).innerText).to.contains('-')
        expect($data.get(5).innerText).to.contains('-')
      })
    punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
    punishmentsAndDamagesPage.changePunishmentCommentLink().should('not.exist')
    punishmentsAndDamagesPage.removePunishmentCommentLink().should('not.exist')
    // punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
  })
  it('should contain the required page elements - status quashed', () => {
    cy.visit(adjudicationUrls.punishmentsAndDamages.urls.report(102))
    const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
    punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
    punishmentsAndDamagesPage.quashedWarning().should('exist')
    punishmentsAndDamagesPage.awardPunishmentsTable().should('exist')
    punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
    punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
    punishmentsAndDamagesPage
      .moneyCautionSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
        expect($summaryData.get(1).innerText).to.contain('No')
      })
    punishmentsAndDamagesPage.punishmentCommentsTable().should('exist')
    punishmentsAndDamagesPage.changePunishmentCommentLink().should('not.exist')
    punishmentsAndDamagesPage.removePunishmentCommentLink().should('not.exist')
    // punishmentsAndDamagesPage.addPunishmentCommentButton().should('exist')
  })
})
