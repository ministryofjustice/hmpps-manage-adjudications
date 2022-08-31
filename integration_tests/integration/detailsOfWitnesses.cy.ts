import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfWitnesses from '../pages/detailsOfWitnesses'
import { WitnessCode, WitnessDetails } from '../../server/data/DraftAdjudicationResult'

const witnessesList = [
  {
    code: WitnessCode.PRISON_OFFICER,
    firstName: 'John',
    lastName: 'Doe',
    reporter: 'USER1',
  },
  {
    code: WitnessCode.OTHER,
    firstName: 'Karen',
    lastName: 'Pertiss',
    reporter: 'USER1',
  },
]

const witnessesListMultiUser = [
  {
    code: WitnessCode.PRISON_OFFICER,
    firstName: 'John',
    lastName: 'Doe',
    reporter: 'USER1',
  },
  {
    code: WitnessCode.OTHER,
    firstName: 'Karen',
    lastName: 'Pertiss',
    reporter: 'USER1',
  },
  {
    code: WitnessCode.STAFF,
    firstName: 'Elizabeth',
    lastName: 'Northern',
    reporter: 'USER2',
  },
  {
    code: WitnessCode.STAFF,
    firstName: 'Ian',
    lastName: 'Norton',
    reporter: 'USER1',
  },
]

const draftAdjudication = (id: number, witnesses: WitnessDetails[]) => {
  return {
    draftAdjudication: {
      id,
      incidentDetails: {
        dateTimeOfIncident: '2021-11-03T13:10:00',
        handoverDeadline: '2021-11-05T13:10:00',
        locationId: 27029,
      },
      prisonerNumber: 'G6415GD',
      startedByUserId: 'USER1',
      incidentRole: {
        associatedPrisonersNumber: undefined,
        roleCode: undefined,
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
      witnesses,
    },
  }
}

const prisonerDetails = {
  offenderNo: 'G6415GD',
  firstName: 'JOHN',
  lastName: 'SMITH',
  assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
}

const officerDetails = {
  activeCaseLoadId: 'MDI',
  name: 'Adam Owens',
  username: 'AOWENS',
  authSource: 'auth',
}

const staffDetails = {
  activeCaseLoadId: 'MDI',
  name: 'Janet Planet',
  username: 'JPLANET',
  authSource: 'auth',
}

context('Details of witnesses', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('stubGetDraftAdjudication', {
      id: 200,
      response: draftAdjudication(200, null),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 201,
      response: draftAdjudication(201, witnessesList),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 202,
      response: draftAdjudication(202, witnessesListMultiUser),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails,
    })
    cy.task('stubGetUserFromUsername', {
      username: 'AOWENS',
      response: officerDetails,
    })
    cy.task('stubGetEmail', {
      username: 'AOWENS',
      response: {
        username: 'AOWENS',
        email: 'aowens@justice.gov.uk',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'JPLANET',
      response: staffDetails,
    })
    cy.task('stubGetEmail', {
      username: 'JPLANET',
      response: {
        username: 'JPLANET',
        email: 'jplanet@justice.gov.uk',
      },
    })
  })
  it('should show the witnesses page with no witnesses added to begin with', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    DetailsOfWitnessesPage.noWitnessesP1().should('exist')
    DetailsOfWitnessesPage.noWitnessesP2().should('exist')
    DetailsOfWitnessesPage.addWitnessButton().should('exist')
    DetailsOfWitnessesPage.saveAndContinue().should('exist')
    DetailsOfWitnessesPage.exitButton().should('exist')
    DetailsOfWitnessesPage.witnessesTable().should('not.exist')
  })
  it('should show witnesses when there are some on the draft', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    DetailsOfWitnessesPage.witnessesTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Name')
        expect($headings.get(1).innerText).to.contain('Role')
      })
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Doe, John')
        expect($data.get(1).innerText).to.contain('Prison officer')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Pertiss, Karen')
        expect($data.get(4).innerText).to.contain('None')
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should remove the correct witness if the remove link is used (first)', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.removeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.modified(201))
      expect(loc.search).to.eq(`?delete=1`)
    })
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Pertiss, Karen')
        expect($data.get(1).innerText).to.contain('None')
      })
  })
  it('should remove the correct witness if the remove link is used (second)', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.removeLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.modified(201))
      expect(loc.search).to.eq(`?delete=2`)
    })
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Doe, John')
        expect($data.get(1).innerText).to.contain('Prison officer')
      })
  })
  it('should remove both damages, remove table and show correct content', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.removeLink(1).click() // Removes first damage in table
    DetailsOfWitnessesPage.removeLink(1).click() // First damage already removed and so second damage is now the first damage listed in table
    DetailsOfWitnessesPage.witnessesTable().should('not.exist')
    DetailsOfWitnessesPage.noWitnessesP1().should('exist')
    DetailsOfWitnessesPage.noWitnessesP2().should('exist')
  })
  it('should take user to the task list if they exit', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(200))
    })
  })
  it('should take user to the add witnesses page if they click the add correct button', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.addWitnessButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.add(200))
    })
  })
  it('should show any witnesses added to the session in the table', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.witnessesTable().should('not.exist')
    DetailsOfWitnessesPage.addWitnessButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.add(200))
    })
    DetailsOfWitnessesPage.addWitnessType().find('input[value="OTHER_PERSON"]').check()
    DetailsOfWitnessesPage.witnessOtherFirstNameInput().type('Jake')
    DetailsOfWitnessesPage.witnessOtherLastNameInput().type('Peters')
    DetailsOfWitnessesPage.addWitnessSubmit().click()
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row plus the Witness we just added
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Peters, Jake')
        expect($data.get(0).innerText).to.not.contain('None')
      })
  })
  it('should not show the remove link for witnesses that the current user did not add', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 4) // This includes the header row plus three data rows
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Doe, John')
        expect($data.get(1).innerText).to.contain('Prison officer')
        expect($data.get(3).innerText).to.contain('Pertiss, Karen')
        expect($data.get(4).innerText).to.contain('None')
        expect($data.get(6).innerText).to.contain('Northern, Elizabeth')
        expect($data.get(7).innerText).to.contain("Member of staff who's not a prison officer")
      })
  })
  it('should be able to add a prison officer using search', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 4) // This includes the header row plus three data rows
    DetailsOfWitnessesPage.addWitnessButton().click()
    DetailsOfWitnessesPage.addWitnessType().find('input[value="OFFICER"]').check()
    DetailsOfWitnessesPage.witnessOfficerSearchFirstNameInput().type('Adam')
    DetailsOfWitnessesPage.witnessOfficerSearchLastNameInput().type('Owens')
    DetailsOfWitnessesPage.searchOfficer().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffFirstName=Adam&staffLastName=Owens`)
    DetailsOfWitnessesPage.simulateReturnFromOfficerSearch(202, 'OFFICER', 'AOWENS')
    DetailsOfWitnessesPage.witnessOfficerHiddenInput().should('have.value', 'AOWENS')
    DetailsOfWitnessesPage.witnessOfficerName().contains('Adam Owens')
    DetailsOfWitnessesPage.addWitnessSubmit().click()
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(9).innerText).to.contain('Owens, Adam')
        expect($data.get(10).innerText).to.contain('Prison officer')
        expect($data.get(11).innerText).to.contain('Remove')
      })
  })
  it('should be able to add a member of staff using search', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 4) // This includes the header row plus three data rows
    DetailsOfWitnessesPage.addWitnessButton().click()
    DetailsOfWitnessesPage.addWitnessType().find('input[value="STAFF"]').check()
    DetailsOfWitnessesPage.witnessStaffSearchFirstNameInput().type('Janet')
    DetailsOfWitnessesPage.witnessStaffSearchLastNameInput().type('Planet')
    DetailsOfWitnessesPage.searchStaff().click()
    cy.url().should(
      'include',
      `${adjudicationUrls.selectAssociatedStaff.root}?staffFirstName=Janet&staffLastName=Planet`
    )
    DetailsOfWitnessesPage.simulateReturnFromStaffSearch(202, 'STAFF', 'JPLANET')
    DetailsOfWitnessesPage.witnessStaffHiddenInput().should('have.value', 'JPLANET')
    DetailsOfWitnessesPage.witnessStaffName().contains('Janet Planet')
    DetailsOfWitnessesPage.addWitnessSubmit().click()
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(9).innerText).to.contain('Planet, Janet')
        expect($data.get(10).innerText).to.contain("Member of staff who's not a prison officer")
        expect($data.get(11).innerText).to.contain('Remove')
      })
  })
  it.only('should still remove the correct witness when there are witnesses listed not created by the current user', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const DetailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    DetailsOfWitnessesPage.removeLink(2).click() // Removes second witness in table
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(3).innerText).to.not.contain('Pertiss, Karen')
        expect($data.get(4).innerText).to.not.contain('None')
        expect($data.get(5).innerText).to.not.contain('Remove')
      })
    DetailsOfWitnessesPage.removeLink(1).click() // Removes first witness in table
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.not.contain('Doe, John')
        expect($data.get(1).innerText).to.not.contain('Prison officer')
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    DetailsOfWitnessesPage.removeLink(2).click() // Removes final available witness
    DetailsOfWitnessesPage.witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Northern, Elizabeth')
        expect($data.get(1).innerText).to.contain("Member of staff who's not a prison officer")
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    DetailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row plus a data rows
  })
})
