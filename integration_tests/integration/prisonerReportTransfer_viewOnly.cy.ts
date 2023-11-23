import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationResult, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()

const reportedAdjudicationResponse = ({
  chargeNumber,
  status,
  statusReason = null,
  statusDetails = null,
  transferableActionsAllowed = false,
  overrideAgencyId = null,
}: {
  chargeNumber: string
  status: ReportedAdjudicationStatus
  statusReason?: string
  statusDetails?: string
  transferableActionsAllowed?: boolean
  overrideAgencyId?: string
}) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      locationId: 25538,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      dateTimeOfDiscovery: '2021-12-10T09:40:00',
      status,
      incidentStatement: {
        statement: 'TESTING',
        completed: true,
      },
      damages: [testData.singleDamage({})],
      evidence: [testData.singleEvidence({ identifier: 'JO1234' })],
      witnesses: [testData.singleWitness({})],
      offenceDetails: {
        offenceCode: 1001,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G5512G',
      },
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
        reviewedByUserId: 'USER1',
        statusReason,
        statusDetails,
        isYouthOffender: false,
        transferableActionsAllowed,
        overrideAgencyId,
        originatingAgencyId: 'MDI',
      },
    }),
  }
}

const draftAdjudication = (reportedAdj: ReportedAdjudicationResult, id: number) => {
  const { reportedAdjudication } = reportedAdj
  return {
    draftAdjudication: testData.draftAdjudication({
      id,
      locationId: 25538,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      dateTimeOfDiscovery: '2021-12-10T09:40:00',
      ...reportedAdjudication,
    }),
  }
}

context('Prisoner report - view only - for transferred prisoners', () => {
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
    cy.task('stubGetLocation', {
      locationId: 25538,
      response: {
        locationId: 25538,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: reportedAdjudicationResponse({
        chargeNumber: '1524493',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      }),
    })
    const awaitingReviewReport = reportedAdjudicationResponse({
      chargeNumber: '1524495',
      status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      transferableActionsAllowed: true,
      overrideAgencyId: 'LEI',
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524495,
      response: awaitingReviewReport,
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: 1524495,
      response: draftAdjudication(awaitingReviewReport, 1),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 1,
      response: draftAdjudication(awaitingReviewReport, 1),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse({
        chargeNumber: '1524494',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        transferableActionsAllowed: true,
        overrideAgencyId: 'LEI',
      }),
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubGetAgency', {
      agencyId: 'MDI',
      response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
    })
    return cy.signIn()
  })
  describe('Status UNSCHEDULED', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.reviewSummaryTitle().should('exist')
      prisonerReportPage.incidentDetailsSummary().should('exist')
      prisonerReportPage.offenceDetailsSummary().should('exist')
      prisonerReportPage.incidentStatement().should('exist')
      prisonerReportPage.chargeNumber().should('exist')
      prisonerReportPage.returnLink().should('exist')
      prisonerReportPage.damageSummary().should('exist')
      prisonerReportPage.hearingsTab().should('exist')
      prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
      prisonerReportPage.baggedAndTaggedEvidenceSummary().should('exist')
      prisonerReportPage.witnessesSummary().should('exist')
      prisonerReportPage.reviewSummary().should('exist')
      prisonerReportPage.reviewerPanel().should('not.exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
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
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(3).innerText).to.contain('Location')
          expect($summaryLabels.get(4).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(5).innerText).to.contain('Time of discovery')
        })

      prisonerReportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('9 December 2021')
          expect($summaryData.get(2).innerText).to.contain('10:30')
          expect($summaryData.get(3).innerText).to.contain('Houseblock 1')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
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
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

      prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should contain the correct report number', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.chargeNumber().should('contain.text', '1524493')
    })
    it('should not have any change links available for changes requiring a draft', () => {
      cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
      const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
      prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
      prisonerReportPage.incidentStatementChangeLink().should('not.exist')
    })
  })
  describe('Flag works', () => {
    describe('transferableActionsAllowed flag off', () => {
      it('should not have access to the damages, evidence and witnesses change links if flag is false', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524493))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.damagesChangeLink().should('not.exist')
        prisonerReportPage.evidenceChangeLink().should('not.exist')
        prisonerReportPage.witnessesChangeLink().should('not.exist')
      })
    })
    describe('transferableActionsAllowed flag on - report status AWAITING_REVIEW', () => {
      it('should not have access to the damages, evidence and witnesses change links even if flag is true', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524495))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.damagesChangeLink().should('not.exist')
        prisonerReportPage.evidenceChangeLink().should('not.exist')
        prisonerReportPage.witnessesChangeLink().should('not.exist')
      })
    })
    describe('transferableActionsAllowed flag on - report status UNSCHEDULED', () => {
      it('should have access to the damages, evidence and witnesses change links if flag is true', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524494))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.damagesChangeLink().should('exist')
        prisonerReportPage.evidenceChangeLink().should('exist')
        prisonerReportPage.witnessesChangeLink().should('exist')
      })
      it('should go to the damages page if the change link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524494))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.damagesChangeLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEdit(1524494))
        })
      })
      it('should go to the evidence page if the change link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524494))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.evidenceChangeLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.submittedEdit(1524494))
        })
      })
      it('should go to the witnesses page if the change link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.viewOnly(1524494))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.witnessesChangeLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(1524494))
        })
      })
    })
  })
})
