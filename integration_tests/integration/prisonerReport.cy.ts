import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { DamageCode, PrisonerGender } from '../../server/data/DraftAdjudicationResult'

const prisonerDetails = (prisonerNumber: string, firstName: string, lastName: string) => {
  return {
    offenderNo: prisonerNumber,
    firstName,
    lastName,
    assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
  }
}

const createDraftFromReportedAdjudicationResponse = (
  adjudicationNumber: number,
  id: number,
  damages = [],
  evidence = [],
  witnesses = []
) => {
  return {
    draftAdjudication: {
      id,
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 234,
        dateTimeOfIncident: '2021-12-01T09:40:00',
        dateTimeOfDiscovery: '2021-12-01T09:40:00',
        handoverDeadline: '2021-12-03T09:40:00',
      },
      incidentStatement: {
        statement: 'TESTING',
        completed: true,
      },
      startedByUserId: 'USER1',
      damages,
      evidence,
      witnesses,
    },
  }
}

const reportedAdjudicationResponse = (
  adjudicationNumber: number,
  status: string,
  reviewedByUserId = null,
  statusReason = null,
  statusDetails = null,
  damages = [],
  evidence = [],
  witnesses = []
) => {
  return {
    reportedAdjudication: {
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      gender: PrisonerGender.MALE.toString(),
      bookingId: 1,
      createdDateTime: undefined,
      createdByUserId: undefined,
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        dateTimeOfDiscovery: '2021-12-10T09:40:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentStatement: undefined,
      incidentRole: {
        roleCode: undefined,
      },
      offenceDetails: [],
      status,
      reviewedByUserId,
      statusReason,
      statusDetails,
      damages,
      evidence,
      witnesses,
    },
  }
}

const draftAdjudicationResponse = (
  id: number,
  adjudicationNumber: number,
  isYouthOffender: boolean,
  damages = [],
  evidence = [],
  witnesses = []
) => {
  return {
    draftAdjudication: {
      id,
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 234,
        dateTimeOfIncident: '2021-12-01T09:40:00',
        dateTimeOfDiscovery: '2021-12-02T10:42:00',
        handoverDeadline: '2021-12-03T09:40:00',
      },
      incidentStatement: {
        statement: 'TESTING',
        completed: true,
      },
      startedByUserId: 'USER1',
      isYouthOffender,
      incidentRole: {
        associatedPrisonersNumber: 'T3356FU',
        roleCode: '25c',
        offenceRule: {
          paragraphNumber: '25(c)',
          paragraphDescription:
            'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
        },
      },
      offenceDetails: [
        {
          offenceCode: 1001,
          offenceRule: {
            paragraphNumber: '1',
            paragraphDescription: 'Commits any assault',
          },
          victimPrisonersNumber: 'G5512G',
        },
      ],
      damages,
      evidence,
      witnesses,
    },
  }
}

context('Prisoner report - reporter view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails('G6415GD', 'JOHN', 'SMITH'),
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: prisonerDetails('T3356FU', 'JAMES', 'JONES'),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: prisonerDetails('G5512G', 'PAUL', 'WRIGHT'),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: createDraftFromReportedAdjudicationResponse(12345, 177),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 56789,
      response: createDraftFromReportedAdjudicationResponse(56789, 188),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 23456,
      response: createDraftFromReportedAdjudicationResponse(23456, 189),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 34567,
      response: createDraftFromReportedAdjudicationResponse(34567, 190),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 98765,
      response: createDraftFromReportedAdjudicationResponse(98765, 191),
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 234,
          agencyId: 'MDI',
          userDescription: 'Workshop 19 - Braille',
        },
      ],
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: reportedAdjudicationResponse(1524493, 'AWAITING_REVIEW'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: reportedAdjudicationResponse(1524493, 'REJECTED', 'USER1', 'expired', 'Too long ago to report now.', [
        {
          code: DamageCode.CLEANING,
          reporter: 'TESTER_GEN',
          details: 'Some test info',
        },
      ]),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 23456,
      response: reportedAdjudicationResponse(1524493, 'RETURNED', 'USER1', 'statement', 'More detail please.'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 34567,
      response: reportedAdjudicationResponse(1524493, 'UNSCHEDULED', 'USER1'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 98765,
      response: reportedAdjudicationResponse(1524494, 'ACCEPTED', 'USER1'), // here
    })
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: draftAdjudicationResponse(177, 12345, true),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 188,
      response: draftAdjudicationResponse(188, 56789, false),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 189,
      response: draftAdjudicationResponse(189, 23456, false),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 190,
      response: draftAdjudicationResponse(190, 34567, false),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 191,
      response: draftAdjudicationResponse(191, 98765, false),
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
    cy.signIn()
  })
  describe('test prisoners', () => {
    ;[
      { id: 12345, readOnly: false, isYouthOffender: true },
      { id: 56789, readOnly: true, isYouthOffender: false },
    ].forEach(prisoner => {
      it('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        prisonerReportPage.reviewSummaryTitle().should('exist')
        prisonerReportPage.incidentDetailsSummary().should('exist')
        prisonerReportPage.offenceDetailsSummary().should('exist')
        prisonerReportPage.incidentStatement().should('exist')
        prisonerReportPage.reportNumber().should('exist')
        prisonerReportPage.returnLink().should('exist')
        if (prisoner.id === 56789) {
          prisonerReportPage.damageSummary().should('exist')
          prisonerReportPage.hearingsTab().should('not.exist')
        } else {
          prisonerReportPage.damageSummary().should('not.exist')
          prisonerReportPage.hearingsTab().should('exist')
        }
        prisonerReportPage.photoVideoEvidenceSummary().should('not.exist')
        prisonerReportPage.baggedAndTaggedEvidenceSummary().should('not.exist')
        prisonerReportPage.witnessesSummary().should('not.exist')
        if (prisoner.id === 12345) {
          prisonerReportPage.reviewSummary().should('not.exist')
        } else {
          prisonerReportPage.reviewSummary().should('exist')
        }
      })
      it('should contain the correct review summary details', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        if (prisoner.id === 12345) {
          prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Awaiting review')
          prisonerReportPage.reviewSummary().should('not.exist')
        } else {
          prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Rejected')
          prisonerReportPage
            .reviewSummary()
            .find('dt')
            .then($summaryLabels => {
              expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
              expect($summaryLabels.get(1).innerText).to.contain('Reason for rejection')
              expect($summaryLabels.get(2).innerText).to.contain('Details')
            })

          prisonerReportPage
            .reviewSummary()
            .find('dd')
            .then($summaryData => {
              expect($summaryData.get(0).innerText).to.contain('T. User')
              expect($summaryData.get(1).innerText).to.contain('More than 48 hours have elapsed since the incident')
              expect($summaryData.get(2).innerText).to.contain('Too long ago to report now.')
            })
        }
      })
      it('should contain the correct incident details', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        prisonerReportPage
          .incidentDetailsSummary()
          .find('dt')
          .then($summaryLabels => {
            expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
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
            expect($summaryData.get(1).innerText).to.contain('1 December 2021')
            expect($summaryData.get(2).innerText).to.contain('09:40')
            expect($summaryData.get(3).innerText).to.contain('Workshop 19 - Braille')
          })
      })
      it('should contain the correct offence details', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
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
            if (prisoner.isYouthOffender) {
              expect($summaryData.get(0).innerText).to.contain('YOI offences\n\nPrison rule 55')
            } else {
              expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
            }
            expect($summaryData.get(1).innerText).to.contain(
              'Assault, fighting, or endangering the health or personal safety of others'
            )
            expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
            expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
            expect($summaryData.get(4).innerText).to.contain('Yes')
            if (prisoner.isYouthOffender) {
              expect($summaryData.get(5).innerText).to.contain(
                'Prison rule 55, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 55, paragraph 1\n\nCommits any assault'
              )
            } else {
              expect($summaryData.get(5).innerText).to.contain(
                'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
              )
            }
          })
      })
      it('should contain the correct incident statement', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        prisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
      })
      it('should contain the correct report number', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        if (prisoner.id === 12345) {
          prisonerReportPage.reportNumber().should('contain.text', '12345')
        } else {
          prisonerReportPage.reportNumber().should('contain.text', '56789')
        }
      })
      it('should not contain the review panel', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.reviewerPanel().should('not.exist')
      })
      it('should go to the damages page if the change link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.id === 56789) {
          prisonerReportPage.damagesChangeLink().should('not.exist')
        } else {
          prisonerReportPage.damagesChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEdit(12345))
          })
        }
      })

      it(`should  ${
        prisoner.readOnly ? 'not' : ''
      } go to the incident details page if the incident details change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          prisonerReportPage.incidentDetailsChangeLink().should('not.exist')
        } else {
          prisonerReportPage.incidentDetailsChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 177))
          })
        }
      })
      it(`should ${
        prisoner.readOnly ? 'not' : ''
      } go to the correct page if the offence details change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          prisonerReportPage.offenceDetailsChangeLink().should('not.exist')
        } else {
          prisonerReportPage.offenceDetailsChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(177))
          })
        }
      })
      it(`should ${
        prisoner.readOnly ? 'not' : ''
      }  go to the incident statement page if the incident statement change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          prisonerReportPage.incidentStatementChangeLink().should('not.exist')
        } else {
          prisonerReportPage.incidentStatementChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.submittedEdit(177))
          })
        }
      })
      it('should go to /your-completed-reports if the return link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        prisonerReportPage.returnLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
        })
      })
    })
  })
  describe('review statuses', () => {
    ;[{ id: 23456 }, { id: 34567 }, { id: 98765 }].forEach(prisoner => {
      it('should contain the correct review summary details', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        if (prisoner.id === 23456) {
          prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Returned')
          prisonerReportPage
            .reviewSummary()
            .find('dt')
            .then($summaryLabels => {
              expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
              expect($summaryLabels.get(1).innerText).to.contain('Reason for return')
              expect($summaryLabels.get(2).innerText).to.contain('Details')
            })

          prisonerReportPage
            .reviewSummary()
            .find('dd')
            .then($summaryData => {
              expect($summaryData.get(0).innerText).to.contain('T. User')
              expect($summaryData.get(1).innerText).to.contain('Incorrect or insufficient information in statement')
              expect($summaryData.get(2).innerText).to.contain('More detail please.')
            })
        } else if (prisoner.id === 34567) {
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
        } else {
          prisonerReportPage.reviewSummaryTitle().should('contain.text', 'Accepted')
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
        }
      })
    })
  })
})
