import AllCompletedReportsPage from '../pages/allReports'
import PrisonerReport from '../pages/prisonerReport'
import hearingTab from '../pages/hearingTab'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'
import { PunishmentType, PrivilegeType } from '../../server/data/PunishmentResult'

const testData = new TestData()

context('Transfers flow', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubUserOriginatingAgency', 'MDI')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER2',
      response: testData.userFromUsername('USER2'),
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'A1234AA',
      response: testData.prisonerResultSummary({
        offenderNo: 'A1234AA',
        firstName: 'HARRY',
        lastName: 'POTTER',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 1,
      response: {
        locationId: 1,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 20002,
      response: {
        paragraphNumber: '20',
        paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
      },
    })
    cy.signIn()
  })
  describe('Accepted reports', () => {
    describe('TransferrableActionsAllowed is false', () => {
      beforeEach(() => {
        const transferredPrisonersAdjudicationUnscheduled = testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2030-11-15T11:30:00',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          incidentStatement: {
            statement: 'This is a statement',
            completed: true,
          },
          offenceDetails: {
            offenceCode: 20002,
            offenceRule: {
              paragraphNumber: '20',
              paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
            },
          },
          outcomes: [],
          otherData: {
            overrideAgencyId: 'LEI',
            transferableActionsAllowed: false,
          },
        })

        const transferredPrisonersAdjudicationScheduled = {
          ...transferredPrisonersAdjudicationUnscheduled,
          chargeNumber: 2,
          status: ReportedAdjudicationStatus.SCHEDULED,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-11-17T11:30:00',
                id: 987,
                locationId: 1,
                agencyId: 'MDI',
              }),
            },
          ],
        }

        const transferredPrisonersAdjudicationReferPolice = {
          ...transferredPrisonersAdjudicationUnscheduled,
          chargeNumber: 3,
          status: ReportedAdjudicationStatus.REFER_POLICE,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-11-17T11:30:00',
                id: 988,
                locationId: 1,
                oicHearingType: OicHearingType.INAD_ADULT,
                outcome: testData.hearingOutcome({ optionalItems: { details: 'This is my reason for referring.' } }),
              }),
              outcome: { outcome: testData.outcome({ details: 'This is my reason for referring.' }) },
            },
          ],
        }

        const transferredPrisonersAdjudicationProved = testData.reportedAdjudication({
          chargeNumber: '4',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2030-11-15T11:30:00',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          incidentStatement: {
            statement: 'This is a statement',
            completed: true,
          },
          offenceDetails: {
            offenceCode: 20002,
            offenceRule: {
              paragraphNumber: '20',
              paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
            },
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
          ],
          otherData: {
            overrideAgencyId: 'LEI',
            transferableActionsAllowed: false,
          },
        })

        const transferredPrisonersAdjudicationProvedPunishments = {
          ...transferredPrisonersAdjudicationProved,
          chargeNumber: 5,
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
        }

        cy.task('stubGetAllReportedAdjudications', {
          number: 0,
          allContent: [transferredPrisonersAdjudicationUnscheduled],
        })
        cy.task('stubGetReportedAdjudication', {
          id: 1,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationUnscheduled,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 2,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationScheduled,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 3,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationReferPolice,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 4,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationProved,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 5,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationProvedPunishments,
          },
        })
        cy.task('stubGetMovementByOffender', {
          response: testData.prisonerMovement({}),
        })
        cy.task('stubGetAgency', {
          agencyId: 'MDI',
          response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
        })
      })
      it('all reports to prisoner report, tabs go to correct places', () => {
        cy.visit(adjudicationUrls.allCompletedReports.root)
        const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
        allCompletedReportsPage.viewReportLink().first().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.viewOnly(1))
        })
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.transferBannerParagraph().should('not.exist')
        prisonerReportPage.damagesChangeLink().should('not.exist')
        prisonerReportPage.evidenceChangeLink().should('not.exist')
        prisonerReportPage.witnessesChangeLink().should('not.exist')
        prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
        prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
        prisonerReportPage.incidentStatementChangeLink().should('not.exist')
        prisonerReportPage.hearingsTab().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.viewOnly('1'))
        })
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1))
        prisonerReportPage.punishmentsTab().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.viewOnly('1'))
        })
      })
      it('Transfer banner - user in originating agency', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.review(1))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage
          .transferBannerHeader()
          .contains('Harry Potter was transferred to Leeds (HMP) on 19 November 2030')
        prisonerReportPage.transferBannerParagraph().should('not.exist')
      })
      it('hearings tab - unscheduled - should be locked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.viewOnly('1'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.noHearingsScheduled().should('exist')
        hearingTabPage.hearingSummaryTable(1).should('not.exist')
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.nextStepRadios().should('not.exist')
        hearingTabPage.nextStepConfirmationButton().should('not.exist')
      })
      it('hearings tab - scheduled - should be locked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.viewOnly('2'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.noHearingsScheduled().should('not.exist')
        hearingTabPage.hearingIndex(1).should('exist')
        hearingTabPage.hearingSummaryTable(1).should('exist')
        hearingTabPage.enterHearingOutcomeButton().should('not.exist')
        hearingTabPage.removeHearingButton().should('not.exist')
        hearingTabPage.changeLink().should('not.exist')
      })
      it('hearings tab - refer to police - should be locked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.viewOnly('3'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.noHearingsScheduled().should('not.exist')
        hearingTabPage.hearingIndex(1).should('exist')
        hearingTabPage.enterReferralOutcomeButton().should('not.exist')
        hearingTabPage.removeReferralButton().should('not.exist')
        hearingTabPage.referralChangeLink().should('not.exist')
      })
      it('punishments tab - unscheduled - should be locked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.viewOnly('1'))
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
      it('punishments tab - proved, no punishments - should be locked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.viewOnly('4'))
        const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
        punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
        punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
        punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
        punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
        punishmentsAndDamagesPage.moneyCautionChangeLink().should('not.exist')
      })
      it('punishments tab - proved, punishments - should be locked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.viewOnly('5'))
        const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
        punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
        punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
        punishmentsAndDamagesPage.awardPunishmentsButton().should('not.exist')
        punishmentsAndDamagesPage.reportQuashedButton().should('not.exist')
        punishmentsAndDamagesPage.moneyCautionChangeLink().should('not.exist')
      })
    })
    describe('TransferrableActionsAllowed is true', () => {
      beforeEach(() => {
        const transferredPrisonersAdjudicationUnscheduled = testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2030-11-15T11:30:00',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          incidentStatement: {
            statement: 'This is a statement',
            completed: true,
          },
          offenceDetails: {
            offenceCode: 20002,
            offenceRule: {
              paragraphNumber: '20',
              paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
            },
          },
          outcomes: [],
          otherData: {
            overrideAgencyId: 'LEI',
            transferableActionsAllowed: true,
          },
        })
        const transferredPrisonersAdjudicationScheduled = {
          ...transferredPrisonersAdjudicationUnscheduled,
          chargeNumber: 2,
          status: ReportedAdjudicationStatus.SCHEDULED,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-11-17T11:30:00',
                id: 987,
                locationId: 1,
              }),
            },
          ],
        }

        const transferredPrisonersAdjudicationReferPolice = {
          ...transferredPrisonersAdjudicationUnscheduled,
          chargeNumber: 3,
          status: ReportedAdjudicationStatus.REFER_POLICE,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-11-17T11:30:00',
                id: 988,
                locationId: 1,
                oicHearingType: OicHearingType.INAD_ADULT,
                outcome: testData.hearingOutcome({ optionalItems: { details: 'This is my reason for referring.' } }),
              }),
              outcome: { outcome: testData.outcome({ details: 'This is my reason for referring.' }) },
            },
          ],
        }
        const transferredPrisonersAdjudicationProved = testData.reportedAdjudication({
          chargeNumber: '4',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2030-11-15T11:30:00',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          incidentStatement: {
            statement: 'This is a statement',
            completed: true,
          },
          offenceDetails: {
            offenceCode: 20002,
            offenceRule: {
              paragraphNumber: '20',
              paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
            },
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
          ],
          otherData: {
            overrideAgencyId: 'LEI',
            transferableActionsAllowed: true,
          },
        })

        const transferredPrisonersAdjudicationProvedPunishments = {
          ...transferredPrisonersAdjudicationProved,
          chargeNumber: 5,
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
        }
        cy.task('stubGetAllReportedAdjudications', {
          number: 0,
          allContent: [transferredPrisonersAdjudicationUnscheduled],
        })
        cy.task('stubGetReportedAdjudication', {
          id: 1,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationUnscheduled,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 2,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationScheduled,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 3,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationReferPolice,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 4,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationProved,
          },
        })
        cy.task('stubGetReportedAdjudication', {
          id: 5,
          response: {
            reportedAdjudication: transferredPrisonersAdjudicationProvedPunishments,
          },
        })
        cy.task('stubGetAgency', {
          agencyId: 'MDI',
          response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
        })
      })
      it('all reports to prisoner report, tabs go to correct places', () => {
        cy.visit(adjudicationUrls.allCompletedReports.root)
        const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
        allCompletedReportsPage.viewReportLink().first().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(1))
        })
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.damagesChangeLink().should('exist')
        prisonerReportPage.evidenceChangeLink().should('exist')
        prisonerReportPage.witnessesChangeLink().should('exist')
        prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
        prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
        prisonerReportPage.incidentStatementChangeLink().should('not.exist')
        prisonerReportPage.hearingsTab().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1'))
        })
        cy.visit(adjudicationUrls.prisonerReport.urls.review(1))
        prisonerReportPage.punishmentsTab().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('1'))
        })
      })
      it('hearings tab - unscheduled - should be unlocked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review('1'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.noHearingsScheduled().should('exist')
        hearingTabPage.hearingSummaryTable(1).should('not.exist')
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.nextStepRadios().should('exist')
        hearingTabPage.nextStepConfirmationButton().should('exist')
      })
      it('hearings tab - scheduled - should be unlocked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review('2'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.noHearingsScheduled().should('not.exist')
        hearingTabPage.hearingIndex(1).should('exist')
        hearingTabPage.hearingSummaryTable(1).should('exist')
        hearingTabPage.enterHearingOutcomeButton().should('exist')
        hearingTabPage.removeHearingButton().should('exist')
        hearingTabPage.changeLink().should('exist')
      })
      it('hearings tab - refer to police - should be unlocked', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review('3'))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.schedulingUnavailableP1().should('not.exist')
        hearingTabPage.schedulingUnavailableP2().should('not.exist')
        hearingTabPage.noHearingsScheduled().should('not.exist')
        hearingTabPage.hearingIndex(1).should('exist')
        hearingTabPage.enterReferralOutcomeButton().should('exist')
        hearingTabPage.removeReferralButton().should('exist')
        hearingTabPage.referralChangeLink().should('exist')
      })
      it('punishments tab - unscheduled - should be locked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('1'))
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
      it('punishments tab - proved, no punishments - should be unlocked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('4'))
        const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
        punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
        punishmentsAndDamagesPage.changePunishmentsButton().should('not.exist')
        punishmentsAndDamagesPage.awardPunishmentsButton().should('exist')
        punishmentsAndDamagesPage.moneyCautionChangeLink().first().should('exist')
      })
      it('punishments tab - proved, punishments - should be unlocked', () => {
        cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('5'))
        const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
        punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
        punishmentsAndDamagesPage.changePunishmentsButton().should('exist')
        punishmentsAndDamagesPage.reportQuashedButton().should('exist')
        punishmentsAndDamagesPage.moneyCautionChangeLink().first().should('exist')
      })
    })
  })
})
context('Transfer banner', () => {
  describe('User is in override agency', () => {
    beforeEach(() => {
      cy.task('stubUserOriginatingAgency', 'LEI')
      cy.task('stubGetAgency', { agencyId: 'LEI', response: { agencyId: 'LEI', description: 'Leeds (HMP)' } })
      cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
      cy.task('stubGetUserFromUsername', {
        username: 'USER1',
        response: testData.userFromUsername('USER1', 'Test User', 'LEI'),
      })
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'A1234AA',
        response: testData.prisonerResultSummary({
          offenderNo: 'A1234AA',
          firstName: 'HARRY',
          lastName: 'POTTER',
        }),
      })
      cy.task('stubGetLocation', {
        locationId: 1,
        response: {
          locationId: 1,
          agencyId: 'MDI',
          locationPrefix: 'MDI-1',
          userDescription: 'Houseblock 1',
        },
      })
      cy.task('stubGetOffenceRule', {
        offenceCode: 20002,
        response: {
          paragraphNumber: '20',
          paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
        },
      })
      const transferredPrisonersAdjudicationUnscheduled = testData.reportedAdjudication({
        chargeNumber: '6',
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2030-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        incidentStatement: {
          statement: 'This is a statement',
          completed: true,
        },
        offenceDetails: {
          offenceCode: 20002,
          offenceRule: {
            paragraphNumber: '20',
            paragraphDescription: 'Uses threatening, abusive or insulting words or behaviour',
          },
        },
        outcomes: [],
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: false,
        },
      })

      const transferredPrisonersAdjudicationScheduled = {
        ...transferredPrisonersAdjudicationUnscheduled,
        chargeNumber: '7',
        status: ReportedAdjudicationStatus.SCHEDULED,
        outcomes: [
          {
            hearing: testData.singleHearing({
              dateTimeOfHearing: '2030-11-17T11:30:00',
              id: 987,
              locationId: 1,
              agencyId: 'MDI',
            }),
          },
        ],
      }
      cy.task('stubGetReportedAdjudication', {
        id: 6,
        response: {
          reportedAdjudication: transferredPrisonersAdjudicationUnscheduled,
        },
      })
      cy.task('stubGetReportedAdjudication', {
        id: 7,
        response: {
          reportedAdjudication: transferredPrisonersAdjudicationScheduled,
        },
      })
      cy.signIn()
    })
    it('prisoner report - scheduled - should show correct title and no extra content', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(6))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.transferBannerHeader().contains('This incident was reported at Moorland (HMP & YOI)')
      prisonerReportPage.transferBannerParagraph().should('not.exist')
    })
    it('prisoner report - scheduled - should show correct title and extra content in banner as hearing is incomplete and user is in override agency', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(7))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.transferBannerHeader().contains('This incident was reported at Moorland (HMP & YOI)')
      prisonerReportPage
        .transferBannerParagraph()
        .contains('They must enter the outcome of the scheduled hearing before any changes can be made.')
    })
  })
})
