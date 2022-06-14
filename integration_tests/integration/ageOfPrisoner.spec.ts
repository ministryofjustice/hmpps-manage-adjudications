import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisoner'
import Page from '../pages/page'

context('Age of the prisoner', () => {
  context('No offences on draft', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: {
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
          dateOfBirth: '1990-10-11',
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            startedByUserId: 'TEST_GEN',
          },
        },
      })
      cy.signIn()
    })

    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.ageOfPrisoner().should('exist')
      AgeOfPrisonerPage.prisonRuleRadios().should('exist')
      AgeOfPrisonerPage.submitButton().should('exist')
      AgeOfPrisonerPage.cancelButton().should('exist')
    })
    it('should show validation message if there is no radio button selected', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.submitButton().click()
      AgeOfPrisonerPage.errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Select which rules apply.')
        })
    })
    it('should show the correct age of the prisoner based on the date of the incident report', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.ageOfPrisoner().should('have.text', '31 years, 0 months')
    })
    it('should redirect the user to the role page if the page receives a valid submission', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.radioAdult().click()
      AgeOfPrisonerPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/incident-role/3456')
      })
    })
    it('should redirect the user to the task list page if they cancel and there are no offences available on the draft adjudication', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.radioYoi().click()
      AgeOfPrisonerPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/place-the-prisoner-on-report/3456')
      })
    })
  })
  context('Offences on draft', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: {
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
          dateOfBirth: '1990-10-11',
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            startedByUserId: 'TEST_GEN',
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
      cy.signIn()
    })
    it('should redirect the user to the check your answers page if they cancel and there are offences available on the draft adjudication', () => {
      cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
      AgeOfPrisonerPage.radioYoi().click()
      AgeOfPrisonerPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/check-your-answers/3456')
      })
    })
  })
})
