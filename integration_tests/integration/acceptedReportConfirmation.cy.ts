import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AcceptedReportConfirmation from '../pages/acceptedReportConfirmation'
import Page from '../pages/page'

const testData = new TestData()

context('Report has been accepted', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2022-11-15T09:10:00',
          handoverDeadline: '2022-11-17T09:30:00',
          otherData: {
            transferableActionsAllowed: true,
          },
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524494',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-03-10T09:00:00',
          handoverDeadline: '2023-03-12T09:00:00',
          otherData: {
            transferableActionsAllowed: false,
          },
        }),
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524493'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.banner().should('exist')
    acceptedReportConfirmationPage.p1().should('exist')
    acceptedReportConfirmationPage.p2().should('exist')
    acceptedReportConfirmationPage.p3().should('exist')
    acceptedReportConfirmationPage.tp1().should('exist')
    acceptedReportConfirmationPage.tp2().should('exist')
    acceptedReportConfirmationPage.tp3().should('exist')
    acceptedReportConfirmationPage.scheduleHearingLink().should('exist')
    acceptedReportConfirmationPage.viewReportLink().should('exist')
    acceptedReportConfirmationPage.allCompletedReportsLink().should('exist')
  })
  it('should contain the required page elements - transfer lock', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524494'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.banner().should('exist')
    acceptedReportConfirmationPage.p1().should('exist')
    acceptedReportConfirmationPage.p2().should('exist')
    acceptedReportConfirmationPage.p3().should('exist')
    acceptedReportConfirmationPage.tp1().should('exist')
    acceptedReportConfirmationPage.tp2().should('exist')
    acceptedReportConfirmationPage.tp3().should('exist')
    acceptedReportConfirmationPage.scheduleHearingLink().should('not.exist')
    acceptedReportConfirmationPage.viewReportLink().should('exist')
    acceptedReportConfirmationPage.allCompletedReportsLink().should('exist')
  })
  it('should contain the correct content', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524493'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.banner().should('contain', 'John Smith’s report has been accepted')
    acceptedReportConfirmationPage
      .p1()
      .should('contain', 'John Smith must be given a printed copy of this report by 9:30 on Thursday 17 November 2022.')
    acceptedReportConfirmationPage
      .p2()
      .should(
        'contain',
        'Once John Smith has received the report, the first hearing should start by the end of the next day. If that day is a Sunday or a public holiday, then the hearing can be on the following working day.'
      )
    acceptedReportConfirmationPage
      .p3()
      .should(
        'contain',
        'Begin to prepare for the hearing, including gathering details about any damages, evidence or witnesses.'
      )
    acceptedReportConfirmationPage.scheduleHearingLink().should('contain', 'schedule a hearing')
    acceptedReportConfirmationPage
      .viewReportLink()
      .should('contain', 'view the report and add damages, evidence or witnesses')
    acceptedReportConfirmationPage.allCompletedReportsLink().should('contain', 'review another report')
  })
  it('should link to the correct schedule hearing page', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524493'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.scheduleHearingLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start('1524493'))
    })
  })
  it('should link to the prisoner report', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524493'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.viewReportLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review('1524493'))
    })
  })
  it('should link to the completed reports page', () => {
    cy.visit(adjudicationUrls.acceptedReportConfirmation.urls.start('1524493'))
    const acceptedReportConfirmationPage = Page.verifyOnPage(AcceptedReportConfirmation)
    acceptedReportConfirmationPage.allCompletedReportsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
    })
  })
})
