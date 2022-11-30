import adjudicationUrls from '../../server/utils/urlGenerator'
import SelectGender from '../pages/selectGender'
import PrisonerSearch from '../pages/prisonerSearch'
import Page from '../pages/page'

const prisoner = {
  prisonerNumber: 'G6415GD',
  response: {
    offenderNo: 'G6415GD',
    firstName: 'JOHN',
    lastName: 'SMITH',
    assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
    dateOfBirth: '1990-10-11',
    physicalAttributes: {
      gender: 'Unknown',
    },
  },
}

context('Select gender', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', prisoner)
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.selectGender.url.start('G6415GD'))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.hint().should('exist')
    selectGenderPage.radios().should('exist')
    selectGenderPage.submitButton().should('exist')
    selectGenderPage.cancelButton().should('exist')
    selectGenderPage.errorSummary().should('not.exist')
  })
  it('should show validation message if there is no radio button selected', () => {
    cy.visit(adjudicationUrls.selectGender.url.start('G6415GD'))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.submitButton().click()
    selectGenderPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the prisoner’s gender')
      })
  })
  it('should redirect the user to the incident details if the page receives a valid submission', () => {
    cy.visit(adjudicationUrls.selectGender.url.start('G6415GD'))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.radioMale().click()
    selectGenderPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    })
  })
  it('should redirect the user to the homepage if they cancel', () => {
    cy.visit(adjudicationUrls.selectGender.url.start('G6415GD'))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-a-prisoner-on-report')
    })
  })
})

context('Select gender edit', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', prisoner)
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          prisonerNumber: 'G6415GD',
          gender: 'MALE',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:00',
            handoverDeadline: '2021-11-05T11:09:00',
            locationId: 234,
          },
          startedByUserId: 'TEST_GEN',
        },
      },
    })
    cy.task('stubAmendPrisonerGender', {
      draftId: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          prisonerNumber: 'G6415GD',
          gender: 'FEMALE',
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
  it('should have the correct gender pre-selected', () => {
    cy.visit(adjudicationUrls.selectGender.url.edit('G6415GD', 3456))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.radioMale().should('be.checked')
  })
  it('should redirect the user to the check your answers page if the page receives a valid submission', () => {
    cy.visit(adjudicationUrls.selectGender.url.edit('G6415GD', 3456))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.radioFemale().click()
    selectGenderPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.checkYourAnswers.urls.start(3456))
    })
  })
  it('should redirect the user to the check your answers page if they cancel', () => {
    cy.visit(adjudicationUrls.selectGender.url.edit('G6415GD', 3456))
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.checkYourAnswers.urls.start(3456))
    })
  })
})

context('Selecting gender pathway - no gender on prisoners profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'A1234AA',
      response: {
        offenderNo: 'A1234AA',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        dateOfBirth: '1990-10-11',
        physicalAttributes: {
          gender: 'Unknown',
        },
      },
    })
    cy.signIn()
  })
  it('should go through correct pathway if there is no gender specified on the prisoners profile', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        lastName: 'Smith',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
          gender: 'Unknown',
        },
      ],
    })

    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('Smith')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(5).innerHTML).to.contain('/select-gender/A1234AA')
      })
    prisonerSearchPage.startReportLinks().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.selectGender.url.start('A1234AA'))
    })
    const selectGenderPage: SelectGender = Page.verifyOnPage(SelectGender)
    selectGenderPage.radioFemale().click()
    selectGenderPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.start('A1234AA'))
    })
  })
  it('should go through correct pathway if there is a specified on the prisoners profile', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        lastName: 'Smith',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
          gender: 'Male',
        },
      ],
    })
    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('Smith')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(5).innerHTML).to.contain('/incident-details/A1234AA')
      })
    prisonerSearchPage.startReportLinks().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.start('A1234AA'))
    })
  })
})
