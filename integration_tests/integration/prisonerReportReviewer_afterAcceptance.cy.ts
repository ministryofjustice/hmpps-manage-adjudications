import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()

const reportedAdjudicationResponse = ({
  chargeNumber,
  status,
  reviewedByUserId = null,
  statusReason = null,
  statusDetails = null,
  isYouthOffender = false,
  paragraphNumber = '1',
  offenceCode = 1001,
  linkedChargeNumbers = [],
}: {
  chargeNumber: string
  status: ReportedAdjudicationStatus
  reviewedByUserId?: string
  statusReason?: string
  statusDetails?: string
  isYouthOffender: boolean
  paragraphNumber?: string
  offenceCode?: number
  linkedChargeNumbers?: string[]
}) => {
  return testData.reportedAdjudication({
    chargeNumber,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-12-09T10:30:00',
    status,
    locationId: 25538,
    incidentStatement: {
      statement: 'TESTING',
      completed: true,
    },
    offenceDetails: {
      offenceCode,
      offenceRule: {
        paragraphNumber,
        paragraphDescription: 'Commits any assault',
      },
      victimPrisonersNumber: 'G5512G',
    },
    damages: [testData.singleDamage({})],
    evidence: [testData.singleEvidence({ identifier: 'JO48376' })],
    witnesses: [testData.singleWitness({})],
    incidentRole: {
      associatedPrisonersNumber: 'T3356FU',
      roleCode: '25c',
      offenceRule: {
        paragraphNumber: '25(c)',
        paragraphDescription:
          'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
      },
    },
    otherData: {
      reviewedByUserId,
      statusReason,
      statusDetails,
      isYouthOffender,
      linkedChargeNumbers,
    },
  })
}

context('Prisoner report - reviewer view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Associated Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })

    cy.task('stubGetReportedAdjudication', {
      id: 456791,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '456791',
          status: ReportedAdjudicationStatus.SCHEDULED,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: '456791-1',
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '456791-1',
          status: ReportedAdjudicationStatus.SCHEDULED,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
          paragraphNumber: '51:1',
          offenceCode: 0,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456789,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '456789',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 500000,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '500000',
          status: ReportedAdjudicationStatus.INVALID_OUTCOME,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 500001,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '500001',
          status: ReportedAdjudicationStatus.INVALID_ADA,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 500002,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '500002',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
          linkedChargeNumbers: ['MDI-000041', 'MDI-000042'],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 500003,
      response: {
        reportedAdjudication: reportedAdjudicationResponse({
          chargeNumber: '500003',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          reviewedByUserId: 'USER1',
          isYouthOffender: false,
          linkedChargeNumbers: ['MDI-000041'],
        }),
      },
    })
    cy.task('stubGetLocation', {})

    cy.task('stubGetDpsLocationId', {})

    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUpdateAdjudicationStatus', {
      chargeNumber: '12345',
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  describe('report UNSCHEDULED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('exist')
      prisonerReportPage.printLink().should('exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.returnLink().contains('Return to all completed reports')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should contain the correct review summary', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Unscheduled')
      prisonerReportPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
        })

      prisonerReportPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .reportDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date report submitted')
          expect($summaryLabels.get(2).innerText).to.contain('Time report submitted')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(1).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(4).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .reportDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('9 December 2022')
          expect($summaryData.get(2).innerText).to.contain('10:30')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('9 December 2021')
          expect($summaryData.get(1).innerText).to.contain('10:30')
          expect($summaryData.get(2).innerText).to.contain('Houseblock 1')
          expect($summaryData.get(3).innerText).to.contain('9 December 2021')
          expect($summaryData.get(4).innerText).to.contain('10:30')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.chargeNumber().should('contain.text', '456789')
    })
    it('should only show the damages, evidence and witnesses change links', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('exist')
      prisonerReportPage.evidenceChangeLink().should('exist')
      prisonerReportPage.witnessesChangeLink().should('exist')
      prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
    it('should go to the all completed reports page if return link clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.returnLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      })
    })
    it('should go to the hearings page if the tab is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.hearingsTab().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('456789'))
      })
    })
    it('should go to the punishments page if the tab is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.punishmentsTab().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('456789'))
      })
    })
  })
  describe('report SCHEDULED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.returnLink().contains('Return to all completed reports')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should contain the correct review summary', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Scheduled')
      prisonerReportPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
        })

      prisonerReportPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(1).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(4).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('9 December 2021')
          expect($summaryData.get(1).innerText).to.contain('10:30')
          expect($summaryData.get(2).innerText).to.contain('Houseblock 1')
          expect($summaryData.get(3).innerText).to.contain('9 December 2021')
          expect($summaryData.get(4).innerText).to.contain('10:30')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.chargeNumber().should('contain.text', '456791')
    })
    it('should only show the damages, evidence and witnesses change links', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.damagesChangeLink().should('exist')
      prisonerReportPage.evidenceChangeLink().should('exist')
      prisonerReportPage.witnessesChangeLink().should('exist')
      prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
    it('should go to the all completed reports page if return link clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.returnLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      })
    })
    it('should go to the hearings page if the tab is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.hearingsTab().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('456791'))
      })
    })
    it('should go to the punishments page if the tab is clicked', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(456791))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.punishmentsTab().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('456791'))
      })
    })
  })
  describe('invalid', () => {
    it('should include the guidance details if invalid - invalid outcome', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(500000))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.guidanceContent().should('exist')
      prisonerReportPage.guidanceContent().contains('Help with ‘invalid outcome’ reports')
      prisonerReportPage
        .guidanceContent()
        .contains('An adjudication may have an ‘invalid outcome’ status because there is')
    })
    it('should include the guidance details if invalid - Invalid added days', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(500001))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.guidanceContent().should('exist')
      prisonerReportPage.guidanceContent().contains('Help with ‘invalid added days’ reports')
      prisonerReportPage
        .guidanceContent()
        .contains(
          'An adjudication with the ‘invalid added days’ status has a punishment of added days but an outcome that is not correct. '
        )
    })
    it('should include the guidance details if the report has linked charges - multiple', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(500002))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.guidanceContent().should('exist')
      prisonerReportPage.guidanceContent().contains('Check that information has been entered on the right charge.')
      prisonerReportPage.guidanceContent().contains('There are other charges for this report:')
      prisonerReportPage.guidanceContent().contains('MDI-000041 (opens in new tab)')
      prisonerReportPage.guidanceContent().contains('MDI-000042 (opens in new tab)')
    })
    it('should include the guidance details if the report has linked charges - single', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review(500003))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.guidanceContent().should('exist')
      prisonerReportPage.guidanceContent().contains('Check that information has been entered on the right charge.')
      prisonerReportPage.guidanceContent().contains('There’s another charge for this report:')
      prisonerReportPage.guidanceContent().contains('MDI-000041 (opens in new tab)')
    })
  })
  describe('report MIGRATED', () => {
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.review('456791-1'))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain('This offence broke')
        })

      prisonerReportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain('Prison rule 51, paragraph 1\n\nCommits any assault')
        })
    })
  })
})
