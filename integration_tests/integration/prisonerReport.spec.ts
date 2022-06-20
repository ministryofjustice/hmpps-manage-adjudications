import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import config from '../../server/config'

context('Prisoner report - reporter view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: {
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: {
        draftAdjudication: {
          id: 177,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'USER1',
        },
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 56789,
      response: {
        draftAdjudication: {
          id: 188,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'USER1',
        },
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 234,
          agencyId: 'MDI',
          userDescription: 'Workshop 19 - Braille',
        },
        {
          locationId: 27008,
          agencyId: 'MDI',
          userDescription: 'Workshop 2',
        },
        {
          locationId: 27009,
          agencyId: 'MDI',
          userDescription: 'Workshop 3 - Plastics',
        },
        {
          locationId: 27010,
          agencyId: 'MDI',
          userDescription: 'Workshop 4 - PICTA',
        },
      ],
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: {
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          bookingId: 1,
          createdDateTime: undefined,
          createdByUserId: undefined,
          incidentDetails: {
            locationId: 197682,
            dateTimeOfIncident: '2021-12-09T10:30:00',
            handoverDeadline: '2021-12-11T10:30:00',
          },
          incidentStatement: undefined,
          incidentRole: {
            roleCode: undefined,
          },
          offenceDetails: [],
          status: 'AWAITING_REVIEW',
        },
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: {
        reportedAdjudication: {
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          bookingId: 1,
          createdDateTime: undefined,
          createdByUserId: undefined,
          incidentDetails: {
            locationId: 197682,
            dateTimeOfIncident: '2021-12-09T10:30:00',
            handoverDeadline: '2021-12-11T10:30:00',
          },
          incidentStatement: undefined,
          incidentRole: {
            roleCode: undefined,
          },
          offenceDetails: [],
          status: 'REJECTED',
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: {
        draftAdjudication: {
          id: 177,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'USER1',
          isYouthOffender: true,
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
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 188,
      response: {
        draftAdjudication: {
          id: 188,
          adjudicationNumber: 56789,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'USER1',
          isYouthOffender: false,
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
        },
      },
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
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        PrisonerReportPage.incidentDetailsSummary().should('exist')
        PrisonerReportPage.offenceDetailsSummary().should('exist')
        PrisonerReportPage.incidentStatement().should('exist')
        PrisonerReportPage.reportNumber().should('exist')
        PrisonerReportPage.returnLink().should('exist')
      })
      it('should contain the correct incident details', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        PrisonerReportPage.incidentDetailsSummary()
          .find('dt')
          .then($summaryLabels => {
            expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
            expect($summaryLabels.get(1).innerText).to.contain('Date')
            expect($summaryLabels.get(2).innerText).to.contain('Time')
            expect($summaryLabels.get(3).innerText).to.contain('Location')
          })

        PrisonerReportPage.incidentDetailsSummary()
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
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        PrisonerReportPage.offenceDetailsSummary()
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

        PrisonerReportPage.offenceDetailsSummary()
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
                // TODO THIS NEEDS SORTING
                'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
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
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        PrisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
      })
      it('should contain the correct report number', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

        if (prisoner.id === 12345) {
          PrisonerReportPage.reportNumber().should('contain.text', '12345')
        } else {
          PrisonerReportPage.reportNumber().should('contain.text', '56789')
        }
      })
      it('should not contain the review panel', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        PrisonerReportPage.reviewerPanel().should('not.exist')
      })

      it(`should  ${
        prisoner.readOnly ? 'not' : ''
      } go to the incident details page if the incident details change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          PrisonerReportPage.incidentDetailsChangeLink().should('not.exist')
        } else {
          PrisonerReportPage.incidentDetailsChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 177))
          })
        }
      })
      it(`should ${
        prisoner.readOnly ? 'not' : ''
      } go to the correct page if the offence details change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          PrisonerReportPage.offenceDetailsChangeLink().should('not.exist')
        } else {
          PrisonerReportPage.offenceDetailsChangeLink().click()
          cy.location().should(loc => {
            if (config.yoiNewPagesFeatureFlag) {
              expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(177))
            } else {
              expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 177))
            }
          })
        }
      })
      it(`should ${
        prisoner.readOnly ? 'not' : ''
      }  go to the incident statement page if the incident statement change link is clicked`, () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        if (prisoner.readOnly) {
          PrisonerReportPage.incidentStatementChangeLink().should('not.exist')
        } else {
          PrisonerReportPage.incidentStatementChangeLink().click()
          cy.location().should(loc => {
            expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.submittedEdit(177))
          })
        }
      })
      it('should go to /your-completed-reports if the return link is clicked', () => {
        cy.visit(adjudicationUrls.prisonerReport.urls.report(prisoner.id))
        const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
        PrisonerReportPage.returnLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
        })
      })
    })
  })
})
