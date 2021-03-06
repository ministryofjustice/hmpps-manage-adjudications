import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

const prisonerResponse = (offenderNo: string, firstName: string, lastName: string) => {
  return {
    offenderNo,
    firstName,
    lastName,
    assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
  }
}

const reportedAdjudication = (status: string) => {
  return {
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
    status,
    isYouthOffender: false,
  }
}

const draftAdjudication = (adjudicationNumber: number) => {
  return {
    id: 177,
    adjudicationNumber,
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
  }
}

context('Prisoner report - reviewer view', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: prisonerResponse('T3356FU', 'JAMES', 'JONES'),
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerResponse('G6415GD', 'JOHN', 'SMITH'),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: prisonerResponse('G5512G', 'PAUL', 'WRIGHT'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: reportedAdjudication('AWAITING_REVIEW'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 56789,
      response: {
        reportedAdjudication: reportedAdjudication('RETURNED'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456789,
      response: {
        reportedAdjudication: reportedAdjudication('ACCEPTED'),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 356789,
      response: {
        reportedAdjudication: reportedAdjudication('REJECTED'),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: {
        draftAdjudication: draftAdjudication(12345),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 56789,
      response: {
        draftAdjudication: draftAdjudication(56789),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 356789,
      response: {
        draftAdjudication: draftAdjudication(356789),
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 456789,
      response: {
        draftAdjudication: draftAdjudication(456789),
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
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
            offenceRule: {
              paragraphNumber: '25(c)',
              paragraphDescription:
                'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
            },
          },
          isYouthOffender: false,
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
    cy.task('stubUpdateAdjudicationStatus', {
      adjudicationNumber: 12345,
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.incidentDetailsSummary().should('exist')
    PrisonerReportPage.offenceDetailsSummary().should('exist')
    PrisonerReportPage.incidentStatement().should('exist')
    PrisonerReportPage.reportNumber().should('exist')
    PrisonerReportPage.reviewerPanel().should('exist')
  })
  it('should contain the correct incident details', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
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
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
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
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
  })
  it('should contain the correct report number', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.reportNumber().should('contain.text', '12345')
  })
  it('should not show a link to the edit incident details page', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.incidentDetailsChangeLink().should('not.exist')
  })
  it('should not show a link to the incident details page', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.offenceDetailsChangeLink().should('not.exist')
  })
  it('should not show a link to edit the incident statement', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.incidentStatementChangeLink().should('not.exist')
  })
  it('should go to /all-completed-reports if the exit button is pressed', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewExit().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
    })
  })
  it('should go to /all-completed-reports if status is accepted and save is pressed and form is valid', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewStatus().find('input[value="accepted"]').check()
    PrisonerReportPage.reviewSubmit().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
    })
  })
  it('should go to /all-completed-reports if status is rejected and save is pressed and form is valid', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewStatus().find('input[value="rejected"]').check()
    PrisonerReportPage.reviewRejectReason().select('expired')
    PrisonerReportPage.reviewRejectDetail().type('123')
    PrisonerReportPage.reviewSubmit().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
    })
  })
  it('should go to /all-completed-reports if status is returned and save is pressed and form is valid', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewStatus().find('input[value="returned"]').check()
    PrisonerReportPage.reviewReportReason().select('offence')
    PrisonerReportPage.reviewReportDetail().type('123')
    PrisonerReportPage.reviewSubmit().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
    })
  })
  it('should display an error if no status is selected and save is pressed', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewSubmit().click()
    cy.get('*[class^="govuk-error-message"]').contains('Enter a review outcome')
  })

  it('should display an error if rejected is selected without a reason and save is pressed', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewStatus().find('input[value="rejected"]').check()
    PrisonerReportPage.reviewSubmit().click()
    cy.get('*[class^="govuk-error-message"]').contains('Enter a reason')
  })
  it('should display an error if returned is selected without a reason and save is pressed', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewStatus().find('input[value="returned"]').check()
    PrisonerReportPage.reviewSubmit().click()
    cy.get('*[class^="govuk-error-message"]').contains('Enter a reason')
  })
  it('should not contain the review panel if status is RETURNED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(56789))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewerPanel().should('not.exist')
  })
  it('should not contain the review panel if status is REJECTED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(356789))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewerPanel().should('not.exist')
  })
  it('should not contain the review panel if status is ACCEPTED', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(456789))
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.reviewerPanel().should('not.exist')
  })
})
