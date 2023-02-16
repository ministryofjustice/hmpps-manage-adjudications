import hearingTab from '../pages/hearingTab'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const hearingDateTimeOne = '2030-01-04T09:00:00'
const hearingDateTimeOneFormatted = '4 January 2030 - 09:00'
const hearingDateTimeTwo = '2030-01-06T10:00:00'
const hearingDateTimeTwoFormatted = '6 January 2030 - 10:00'
const hearingDateTimeThree = '2030-01-07T11:00:00'
const hearingDateTimeThreeFormatted = '7 January 2030 - 11:00'

const reportedAdjudicationResponse = (
  adjudicationNumber: number,
  status: ReportedAdjudicationStatus,
  hearings = []
) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      hearings,
      status,
    }),
  }
}

const singleHearing = [
  testData.singleHearing({
    dateTimeOfHearing: hearingDateTimeOne,
    id: 987,
    locationId: 123,
  }),
]

const secondHearing = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  oicHearingType: OicHearingType.INAD_ADULT,
})

const thirdHearing = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeThree,
  id: 989,
  locationId: 234,
})

const hearingListAfterDeletion = [singleHearing[0], secondHearing]

const multipleHearings = [singleHearing[0], secondHearing, thirdHearing]

context('Hearing details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
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
      response: reportedAdjudicationResponse(1524493, ReportedAdjudicationStatus.AWAITING_REVIEW),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524480,
      response: reportedAdjudicationResponse(1524480, ReportedAdjudicationStatus.RETURNED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524481,
      response: reportedAdjudicationResponse(1524481, ReportedAdjudicationStatus.REJECTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, ReportedAdjudicationStatus.ACCEPTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524497,
      response: reportedAdjudicationResponse(1524497, ReportedAdjudicationStatus.UNSCHEDULED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524495,
      response: reportedAdjudicationResponse(1524495, ReportedAdjudicationStatus.SCHEDULED, singleHearing),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524496,
      response: reportedAdjudicationResponse(1524496, ReportedAdjudicationStatus.SCHEDULED, multipleHearings),
    })
    cy.signIn()
  })
  describe('Test scenarios - reviewer view', () => {
    beforeEach(() => {
      cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    })
    ;[
      { id: 1524480 },
      { id: 1524481 },
      { id: 1524493 },
      { id: 1524494 },
      { id: 1524497 },
      { id: 1524495 },
      { id: 1524496 },
    ].forEach(adj => {
      it('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review(adj.id))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.reviewStatus().should('exist')
        hearingTabPage.ReturnToAllHearingsLink().should('exist')
        hearingTabPage.viewAllCompletedReportsLink().should('exist')
        if (adj.id === 1524493 || adj.id === 1524480 || adj.id === 1524481) {
          hearingTabPage.schedulingUnavailableP1().should('exist')
          hearingTabPage.schedulingUnavailableP2().should('exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
          hearingTabPage.summaryTable().should('not.exist')
        } else if (adj.id === 1524494) {
          hearingTabPage.summaryTable().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
        } else if (adj.id === 1524497) {
          hearingTabPage.summaryTable().should('not.exist')
          hearingTabPage.noHearingsScheduled().should('exist')
          hearingTabPage.nextStepRadios().should('exist')
          hearingTabPage.nextStepConfirmationButton().should('exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
        } else if (adj.id === 1524495) {
          // SCHEDULED - single hearing
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.summaryTable().should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('exist')
          hearingTabPage.cancelHearingButton(987).should('exist')
        } else {
          // SCHEDULED - multiple hearings
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.hearingIndex(2).should('exist')
          hearingTabPage.hearingIndex(3).should('exist')
          hearingTabPage.summaryTable().should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('exist')
          hearingTabPage.cancelHearingButton(989).should('exist')
          hearingTabPage.cancelHearingButton(988).should('not.exist')
          hearingTabPage.cancelHearingButton(987).should('not.exist')
        }
      })
    })
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524493))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Awaiting review')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication returned', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524480))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Returned')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication rejected', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524481))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Rejected')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524494))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Bottom links work', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.noHearingsScheduled().contains('No scheduled hearings.')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
      hearingTabPage.viewAllCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      hearingTabPage.ReturnToAllHearingsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
      })
    })
    it('Adjudication UNSCHEDULED - first radio goes to schedule a hearing page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadios().find('input[value="SCHEDULE_HEARING"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start(1524497))
      })
    })
    it('Adjudication UNSCHEDULED - second radio goes to refer to police (no hearing) page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadios().find('input[value="REFER_POLICE"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForReferral.urls.start(1524497))
      })
    })
    it('Adjudication UNSCHEDULED - third radio goes to not proceed with page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadios().find('input[value="NOT_PROCEED"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start(1524497))
      })
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524495))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      hearingTabPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(2).innerText).to.contain('Adj 1')
          expect($summaryData.get(4).innerText).to.contain('Governor')
        })
      hearingTabPage.enterHearingOutcomeButton().contains('Enter the hearing outcome')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
    })
    it('Adjudication SCHEDULED multiple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage.hearingIndex(2).contains('Hearing 2')
      hearingTabPage.enterHearingOutcomeButton().should('have.length', 1)
      hearingTabPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      hearingTabPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(4).innerText).to.contain('Adj 2')
          expect($summaryData.get(5).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(6).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(7).innerText).to.contain('Change')
          expect($summaryData.get(8).innerText).to.contain('Adj 2')
          expect($summaryData.get(9).innerText).to.contain('Change')
          expect($summaryData.get(10).innerText).to.contain('Governor')
          expect($summaryData.get(11).innerText).to.contain('Change')
        })
    })
    it('Adjudications SCHEDULED - goes to the correct page when you click a change link - single hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524495))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit(1524495, 987))
      })
    })
    it('Adjudications SCHEDULED - multiple hearings - change links only available on latest hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit(1524496, 989)) // should be the latest hearing
      })
    })
    it('Successfully cancels the latest hearing', () => {
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(1524497, ReportedAdjudicationStatus.SCHEDULED, multipleHearings),
      })
      cy.task('stubCancelHearing', {
        adjudicationNumber: 1524497,
        hearingId: 989,
        response: reportedAdjudicationResponse(1524497, ReportedAdjudicationStatus.SCHEDULED, hearingListAfterDeletion),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(1524497, ReportedAdjudicationStatus.SCHEDULED, hearingListAfterDeletion),
      })
      hearingTabPage.cancelHearingButton(989).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524497))
      })
      const hearingDetailsPageAfterDeletion = Page.verifyOnPage(hearingTab)
      hearingDetailsPageAfterDeletion.hearingIndex(1).should('exist')
      hearingDetailsPageAfterDeletion.hearingIndex(2).should('exist')
      hearingDetailsPageAfterDeletion.hearingIndex(3).should('not.exist') // There were three hearings but now should only be two
      hearingDetailsPageAfterDeletion.cancelHearingButton(989).should('not.exist') // The cancel button linked to the deleted hearing should not exist anymore
      hearingDetailsPageAfterDeletion.cancelHearingButton(988).should('exist') // The cancel button should now be linked to the latest hearing available
      hearingDetailsPageAfterDeletion
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Adj 2')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(6).innerText).to.contain('Change')
        })
    })
  })
  describe('Test scenarios - reporter view', () => {
    ;[{ id: 1524480 }, { id: 1524493 }, { id: 1524494 }, { id: 1524495 }, { id: 1524496 }, { id: 1524497 }].forEach(
      adj => {
        it('should contain the required page elements', () => {
          cy.visit(adjudicationUrls.hearingDetails.urls.report(adj.id))
          const hearingTabPage = Page.verifyOnPage(hearingTab)
          hearingTabPage.reviewStatus().should('exist')
          hearingTabPage.cancelHearingButton(1).should('not.exist')
          hearingTabPage.viewAllCompletedReportsLink().should('not.exist')
          hearingTabPage.ReturnToAllHearingsLink().should('not.exist')
          if (adj.id === 1524493 || adj.id === 1524480) {
            // AWAITING_REVIEW & RETURNED ADJUDICATIONS
            hearingTabPage.schedulingUnavailableP1().should('exist')
            hearingTabPage.schedulingUnavailableP2().should('exist')
            hearingTabPage.noHearingsScheduled().should('not.exist')
            hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
            hearingTabPage.summaryTable().should('not.exist')
          } else if (adj.id === 1524494) {
            // ACCEPTED ADJUDICATION
            hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
            hearingTabPage.schedulingUnavailableP1().should('not.exist')
            hearingTabPage.schedulingUnavailableP2().should('not.exist')
            hearingTabPage.summaryTable().should('not.exist')
          } else if (adj.id === 1524497) {
            // UNSCHEDULED ADJUDICATION
            hearingTabPage.noHearingsScheduled().should('exist')
            hearingTabPage.summaryTable().should('not.exist')
            hearingTabPage.schedulingUnavailableP1().should('not.exist')
            hearingTabPage.schedulingUnavailableP2().should('not.exist')
            hearingTabPage.nextStepRadios().should('not.exist') // not available to reporters
            hearingTabPage.nextStepConfirmationButton().should('not.exist') // not available to reporters
          } else {
            // SCHEDULED ADJUDICATION
            hearingTabPage.schedulingUnavailableP1().should('not.exist')
            hearingTabPage.schedulingUnavailableP2().should('not.exist')
            hearingTabPage.noHearingsScheduled().should('not.exist')
            hearingTabPage.enterHearingOutcomeButton().should('not.exist') // not available to reporters
            hearingTabPage.cancelHearingButton(1).should('not.exist') // not available to reporters
          }
        })
      }
    )
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524493))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Awaiting review')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524494))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Adjudication UNSCHEDULED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.noHearingsScheduled().contains('No scheduled hearings.')
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524495))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })
      hearingTabPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
        })
    })
    it('Adjudication SCHEDULED multiple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524496))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage.hearingIndex(2).contains('Hearing 2')
      hearingTabPage.hearingIndex(3).contains('Hearing 3')
      hearingTabPage
        .summaryTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      hearingTabPage
        .summaryTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(4).innerText).to.contain('Adj 2')
          expect($summaryData.get(5).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(6).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(7).innerText).to.contain('Adj 2')
          expect($summaryData.get(8).innerText).to.contain('Governor')
        })
      hearingTabPage.changeLink().should('not.exist')
    })
  })
})
