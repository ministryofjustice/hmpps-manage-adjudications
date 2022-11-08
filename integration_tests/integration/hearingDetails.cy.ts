import hearingDetails from '../pages/hearingDetails'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

const prisonerDetails = (prisonerNumber: string, firstName: string, lastName: string) => {
  return {
    offenderNo: prisonerNumber,
    firstName,
    lastName,
    assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
  }
}

const reportedAdjudicationResponse = (adjudicationNumber: number, status: string, hearings = []) => {
  return {
    reportedAdjudication: {
      adjudicationNumber,
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
      status,
      reviewedByUserId: 'USER1',
      statusReason: undefined,
      statusDetails: undefined,
      damages: [],
      evidence: [],
      witnesses: [],
      hearings,
    },
  }
}

const singleHearing = [
  {
    id: 987,
    dateTimeOfHearing: '2022-10-20T10:00:00',
    locationId: 123,
    oicHearingType: 'GOV_ADULT',
  },
]

const hearingListAfterDeletion = [
  {
    id: 988,
    dateTimeOfHearing: '2022-10-21T11:00:00',
    locationId: 234,
    oicHearingType: 'GOV_ADULT',
  },
]

const multipleHearings = [
  {
    id: 987,
    dateTimeOfHearing: '2022-10-20T09:00:00',
    locationId: 123,
    oicHearingType: 'GOV_ADULT',
  },
  {
    id: 988,
    dateTimeOfHearing: '2022-10-21T11:00:00',
    locationId: 234,
    oicHearingType: 'GOV_ADULT',
  },
]

context('Hearing deails page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails('G6415GD', 'JOHN', 'SMITH'),
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubGetLocation', {
      locationId: 234,
      response: {
        locationId: 234,
        agencyId: 'MDI',
        userDescription: 'Adj 2',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: reportedAdjudicationResponse(1524493, 'AWAITING_REVIEW'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524480,
      response: reportedAdjudicationResponse(1524480, 'RETURNED'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, 'ACCEPTED'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524497,
      response: reportedAdjudicationResponse(1524497, 'UNSCHEDULED'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524495,
      response: reportedAdjudicationResponse(1524495, 'SCHEDULED', singleHearing),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524496,
      response: reportedAdjudicationResponse(1524496, 'SCHEDULED', multipleHearings),
    })
    cy.signIn()
  })
  describe('Test scenarios - reviewer view', () => {
    beforeEach(() => {
      cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    })
    ;[{ id: 1524480 }, { id: 1524493 }, { id: 1524494 }, { id: 1524495 }, { id: 1524496 }, { id: 1524497 }].forEach(
      adj => {
        it('should contain the required page elements', () => {
          cy.visit(adjudicationUrls.hearingDetails.urls.review(adj.id))
          const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
          hearingDetailsPage.reviewStatus().should('exist')
          hearingDetailsPage.viewYourCompletedReportsLink().should('not.exist')
          if (adj.id === 1524493 || adj.id === 1524480) {
            hearingDetailsPage.schedulingUnavailableP1().should('exist')
            hearingDetailsPage.schedulingUnavailableP2().should('exist')
            hearingDetailsPage.noHearingsScheduled().should('not.exist')
            hearingDetailsPage.summaryTable().should('not.exist')
          } else if (adj.id === 1524494) {
            hearingDetailsPage.summaryTable().should('not.exist')
            hearingDetailsPage.noHearingsScheduled().should('exist')
            hearingDetailsPage.scheduleHearingButton().should('not.exist')
            hearingDetailsPage.viewAllCompletedReportsLink().should('exist')
          } else if (adj.id === 1524497) {
            hearingDetailsPage.summaryTable().should('not.exist')
            hearingDetailsPage.noHearingsScheduled().should('exist')
            hearingDetailsPage.scheduleHearingButton().should('exist')
            hearingDetailsPage.viewAllCompletedReportsLink().should('exist')
          } else {
            hearingDetailsPage.summaryTable().should('exist')
            hearingDetailsPage.cancelHearingButton(987).should('exist')
            hearingDetailsPage.hearingIndex(1).should('exist')
            hearingDetailsPage.viewAllCompletedReportsLink().should('exist')
            hearingDetailsPage.scheduleHearingButton().should('exist')
          }
          if (adj.id === 1524496) {
            hearingDetailsPage.cancelHearingButton(988).should('exist')
            hearingDetailsPage.hearingIndex(1).should('exist')
          }
        })
      }
    )
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524493))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Awaiting review')
      hearingDetailsPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingDetailsPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication returned', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524480))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Returned')
      hearingDetailsPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingDetailsPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524494))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Accepted')
      hearingDetailsPage.noHearingsScheduled().contains('Not scheduled.')
      hearingDetailsPage.scheduleHearingButton().should('not.exist')
    })
    it('Adjudication UNSCHEDULED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Unscheduled')
      hearingDetailsPage.noHearingsScheduled().contains('Not scheduled.')
      hearingDetailsPage.scheduleHearingButton().contains('Schedule a hearing')
      hearingDetailsPage.viewAllCompletedReportsLink().contains('Return to all completed reports')
      hearingDetailsPage.viewAllCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
      })
    })
    it('goes to schedule hearing page when button clicked', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.scheduleHearingButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start(1524497))
      })
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524495))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Scheduled')
      hearingDetailsPage.hearingIndex(1).contains('Hearing 1')
      hearingDetailsPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })

      hearingDetailsPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('20 October 2022 - 10:00')
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 1')
        })
      hearingDetailsPage.viewAllCompletedReportsLink().contains('Return to all completed reports')
      hearingDetailsPage.viewAllCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
      })
    })
    it('Adjudication SCHEDULED multiple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Scheduled')
      hearingDetailsPage.hearingIndex(1).contains('Hearing 1')
      hearingDetailsPage.hearingIndex(2).contains('Hearing 2')
      hearingDetailsPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })

      hearingDetailsPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('20 October 2022 - 09:00')
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 1')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('21 October 2022 - 11:00')
          expect($summaryData.get(5).innerText).to.contain('Change')
          expect($summaryData.get(6).innerText).to.contain('Adj 2')
          expect($summaryData.get(7).innerText).to.contain('Change')
        })
      hearingDetailsPage.viewAllCompletedReportsLink().contains('Return to all completed reports')
      hearingDetailsPage.viewAllCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
      })
    })
    it('Goes to the correct page when you click a change link', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit(1524496, 987))
      })
    })
    it('Successfully cancels a hearing', () => {
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(1524497, 'SCHEDULED', multipleHearings),
      })
      cy.task('stubCancelHearing', {
        adjudicationNumber: 1524497,
        hearingId: 987,
        response: reportedAdjudicationResponse(1524497, 'SCHEDULED', hearingListAfterDeletion),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(1524497, 'SCHEDULED', hearingListAfterDeletion),
      })
      hearingDetailsPage.cancelHearingButton(987).click() // deleting the first hearing in the list with id 987

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524497))
      })
      const hearingDetailsPageAfterDeletion = Page.verifyOnPage(hearingDetails)
      hearingDetailsPageAfterDeletion.hearingIndex(1).should('exist')
      hearingDetailsPageAfterDeletion.hearingIndex(2).should('not.exist') // There were two hearings but now should only be one
      hearingDetailsPageAfterDeletion.cancelHearingButton(987).should('not.exist')
      hearingDetailsPageAfterDeletion
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('21 October 2022 - 11:00')
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 2')
          expect($summaryData.get(3).innerText).to.contain('Change')
        })
    })
  })
  describe('Test scenarios - reporter view', () => {
    ;[{ id: 1524480 }, { id: 1524493 }, { id: 1524494 }, { id: 1524495 }, { id: 1524496 }, { id: 1524497 }].forEach(
      adj => {
        it('should contain the required page elements', () => {
          cy.visit(adjudicationUrls.hearingDetails.urls.report(adj.id))
          const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
          hearingDetailsPage.reviewStatus().should('exist')
          hearingDetailsPage.scheduleHearingButton().should('not.exist')
          hearingDetailsPage.cancelHearingButton(1).should('not.exist')
          hearingDetailsPage.viewAllCompletedReportsLink().should('not.exist')
          if (adj.id === 1524493 || adj.id === 1524480) {
            hearingDetailsPage.schedulingUnavailableP1().should('exist')
            hearingDetailsPage.schedulingUnavailableP2().should('exist')
            hearingDetailsPage.summaryTable().should('not.exist')
            hearingDetailsPage.noHearingsScheduled().should('not.exist')
          } else if (adj.id === 1524494) {
            hearingDetailsPage.noHearingsScheduled().should('exist')
            hearingDetailsPage.schedulingUnavailableP1().should('not.exist')
            hearingDetailsPage.schedulingUnavailableP2().should('not.exist')
            hearingDetailsPage.summaryTable().should('not.exist')
            hearingDetailsPage.viewYourCompletedReportsLink().should('exist')
          } else if (adj.id === 1524497) {
            hearingDetailsPage.noHearingsScheduled().should('exist')
            hearingDetailsPage.schedulingUnavailableP1().should('not.exist')
            hearingDetailsPage.schedulingUnavailableP2().should('not.exist')
            hearingDetailsPage.summaryTable().should('not.exist')
            hearingDetailsPage.viewYourCompletedReportsLink().should('exist')
          } else {
            hearingDetailsPage.schedulingUnavailableP1().should('not.exist')
            hearingDetailsPage.schedulingUnavailableP2().should('not.exist')
            hearingDetailsPage.noHearingsScheduled().should('not.exist')
          }
        })
      }
    )
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524493))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Awaiting review')
      hearingDetailsPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingDetailsPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524494))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Accepted')
      hearingDetailsPage.noHearingsScheduled().contains('Not scheduled.')
      hearingDetailsPage.viewYourCompletedReportsLink().contains('Return to your completed reports')
      hearingDetailsPage.viewYourCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.urls.start())
      })
    })
    it('Adjudication UNSCHEDULED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524497))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Unscheduled')
      hearingDetailsPage.noHearingsScheduled().contains('Not scheduled.')
      hearingDetailsPage.viewYourCompletedReportsLink().contains('Return to your completed reports')
      hearingDetailsPage.viewYourCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.urls.start())
      })
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524495))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Scheduled')
      hearingDetailsPage.hearingIndex(1).contains('Hearing 1')
      hearingDetailsPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })

      hearingDetailsPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('20 October 2022 - 10:00')
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
        })
      hearingDetailsPage.viewYourCompletedReportsLink().contains('Return to your completed reports')
      hearingDetailsPage.viewYourCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.urls.start())
      })
    })
    it('Adjudication SCHEDULED muliple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524496))
      const hearingDetailsPage = Page.verifyOnPage(hearingDetails)
      hearingDetailsPage.reviewStatus().contains('Scheduled')
      hearingDetailsPage.hearingIndex(1).contains('Hearing 1')
      hearingDetailsPage.hearingIndex(2).contains('Hearing 2')
      hearingDetailsPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })

      hearingDetailsPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('20 October 2022 - 09:00')
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
          expect($summaryData.get(2).innerText).to.contain('21 October 2022 - 11:00')
          expect($summaryData.get(3).innerText).to.contain('Adj 2')
        })
      hearingDetailsPage.viewYourCompletedReportsLink().contains('Return to your completed reports')
      hearingDetailsPage.viewYourCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.urls.start())
      })
    })
  })
})
