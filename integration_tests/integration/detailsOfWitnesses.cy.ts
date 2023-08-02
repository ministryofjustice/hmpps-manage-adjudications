import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfWitnesses from '../pages/detailsOfWitnesses'
import { WitnessCode, WitnessDetails } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const witnessesList = [
  testData.singleWitness({ reporter: 'USER1' }),
  testData.singleWitness({ code: WitnessCode.OTHER_PERSON, reporter: 'USER1' }),
]

const witnessesListMultiUser = [
  testData.singleWitness({ reporter: 'USER1' }),
  testData.singleWitness({
    code: WitnessCode.OTHER_PERSON,
    firstName: 'Digital',
    lastName: 'Prison',
    reporter: 'USER1',
  }),
  testData.singleWitness({ code: WitnessCode.STAFF, reporter: 'USER2' }),
  testData.singleWitness({ code: WitnessCode.STAFF, reporter: 'USER1' }),
]

const draftAdjudication = (id: number, witnesses: WitnessDetails[]) => {
  return {
    draftAdjudication: testData.draftAdjudication({
      id,
      prisonerNumber: 'G6415GD',
      witnesses,
    }),
  }
}

const reportedAdjudication = (chargeNumber: string, witnesses: WitnessDetails[]) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      witnesses,
    }),
  }
}

const prisonerDetails = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'JOHN',
  lastName: 'SMITH',
})

const officerDetails = testData.staffFromUsername('AOWENS')
const staffDetails = testData.staffFromUsername('JPLANET')

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
      response: testData.emailFromUsername('AOWENS'),
    })
    cy.task('stubGetUserFromUsername', {
      username: 'JPLANET',
      response: staffDetails,
    })
    cy.task('stubGetEmail', {
      username: 'JPLANET',
      response: testData.emailFromUsername('JPLANET'),
    })
    cy.task('stubSaveWitnessDetails', {
      chargeNumber: '201',
      response: draftAdjudication(201, witnessesList),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: reportedAdjudication('12345', null),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 23456,
      response: reportedAdjudication('23456', witnessesList),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 34567,
      response: reportedAdjudication('34567', witnessesListMultiUser),
    })
  })
  it('should show the witnesses page with no witnesses added to begin with', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    detailsOfWitnessesPage.noWitnessesP1().should('exist')
    detailsOfWitnessesPage.noWitnessesP2().should('exist')
    detailsOfWitnessesPage.addWitnessButton().should('exist')
    detailsOfWitnessesPage.saveAndContinue().should('exist')
    detailsOfWitnessesPage.exitButton().should('exist')
    detailsOfWitnessesPage.witnessesTable().should('not.exist')
  })
  it('should show witnesses when there are some on the draft', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    detailsOfWitnessesPage
      .witnessesTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Name')
        expect($headings.get(1).innerText).to.contain('Role')
      })
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Lastname, Firstname')
        expect($data.get(1).innerText).to.contain('Prison officer')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Lastname, Firstname')
        expect($data.get(4).innerText).to.contain('None')
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should remove the correct witness if the remove link is used (first)', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.removeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.modified(201))
      expect(loc.search).to.eq(`?delete=1`)
    })
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Lastname, Firstname')
        expect($data.get(1).innerText).to.contain('None')
      })
  })
  it('should remove the correct witness if the remove link is used (second)', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.removeLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.modified(201))
      expect(loc.search).to.eq(`?delete=2`)
    })
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Lastname, Firstname')
        expect($data.get(1).innerText).to.contain('Prison officer')
      })
  })
  it('should remove both damages, remove table and show correct content', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.removeLink(1).click() // Removes first damage in table
    detailsOfWitnessesPage.removeLink(1).click() // First damage already removed and so second damage is now the first damage listed in table
    detailsOfWitnessesPage.witnessesTable().should('not.exist')
    detailsOfWitnessesPage.noWitnessesP1().should('exist')
    detailsOfWitnessesPage.noWitnessesP2().should('exist')
  })
  it('should take user to the task list if they exit', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(200))
    })
  })
  it('should take user to the add witnesses page if they click the add correct button', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.addWitnessButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.add(200))
    })
  })
  it('should show any witnesses added to the session in the table', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(200))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.witnessesTable().should('not.exist')
    detailsOfWitnessesPage.addWitnessButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.add(200))
    })
    detailsOfWitnessesPage.addWitnessType().find('input[value="OTHER_PERSON"]').check()
    detailsOfWitnessesPage.witnessOtherNameInput().type('Jake Peters')
    detailsOfWitnessesPage.addWitnessSubmit().click()
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row plus the Witness we just added
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Peters, Jake')
        expect($data.get(0).innerText).to.not.contain('None')
      })
  })
  it('should not show the remove link for witnesses that the current user did not add', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 5)
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Lastname, Firstname')
        expect($data.get(1).innerText).to.contain('Prison officer')
        expect($data.get(3).innerText).to.contain('Prison, Digital')
        expect($data.get(4).innerText).to.contain('None')
        expect($data.get(6).innerText).to.contain('Lastname, Firstname')
        expect($data.get(7).innerText).to.contain("Member of staff who's not a prison officer")
      })
  })
  it('should be able to add a prison officer using search', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 5)
    detailsOfWitnessesPage.addWitnessButton().click()
    detailsOfWitnessesPage.addWitnessType().find('input[value="OFFICER"]').check()
    detailsOfWitnessesPage.witnessOfficerSearchNameInput().type('Adam Owens')
    detailsOfWitnessesPage.searchOfficer().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=Adam%20Owens`)
    detailsOfWitnessesPage.simulateReturnFromOfficerSearch(202, 'OFFICER', 'AOWENS')
    detailsOfWitnessesPage.witnessOfficerHiddenInput().should('have.value', 'AOWENS')
    detailsOfWitnessesPage.witnessOfficerName().contains('Test User')
    detailsOfWitnessesPage.addWitnessSubmit().click()
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(12).innerText).to.contain('User, Test')
        expect($data.get(13).innerText).to.contain('Prison officer')
        expect($data.get(14).innerText).to.contain('Remove')
      })
  })
  it('should be able to add a member of staff using search', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 5)
    detailsOfWitnessesPage.addWitnessButton().click()
    detailsOfWitnessesPage.addWitnessType().find('input[value="STAFF"]').check()
    detailsOfWitnessesPage.witnessStaffSearchNameInput().type('Janet Planet')
    detailsOfWitnessesPage.searchStaff().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=Janet%20Planet`)
    detailsOfWitnessesPage.simulateReturnFromStaffSearch(202, 'STAFF', 'JPLANET')
    detailsOfWitnessesPage.witnessStaffHiddenInput().should('have.value', 'JPLANET')
    detailsOfWitnessesPage.witnessStaffName().contains('Test User')
    detailsOfWitnessesPage.addWitnessSubmit().click()
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(12).innerText).to.contain('User, Test')
        expect($data.get(13).innerText).to.contain("Member of staff who's not a prison officer")
        expect($data.get(14).innerText).to.contain('Remove')
      })
  })
  it('should still remove the correct witness when there are witnesses listed not created by the current user', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(202))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

    detailsOfWitnessesPage.removeLink(2).click() // Removes second witness in table
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(3).innerText).to.not.contain('Prison, Digital')
        expect($data.get(4).innerText).to.not.contain('None')
        expect($data.get(5).innerText).to.not.contain('Remove')
      })
    detailsOfWitnessesPage.removeLink(1).click() // Removes first witness in table
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.not.contain('Prison, Digital')
        expect($data.get(1).innerText).to.not.contain('Prison officer')
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    detailsOfWitnessesPage.removeLink(2).click() // Removes final available witness
    detailsOfWitnessesPage
      .witnessesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Lastname, Firstname')
        expect($data.get(1).innerText).to.contain("Member of staff who's not a prison officer")
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row plus a data rows
  })
  it('should submit the witnesses and move to the next page', () => {
    cy.visit(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
    detailsOfWitnessesPage.addWitnessButton().click()
    detailsOfWitnessesPage.addWitnessType().find('input[value="OTHER_PERSON"]').check()
    detailsOfWitnessesPage.witnessOtherNameInput().type('Jake Peters')
    detailsOfWitnessesPage.addWitnessSubmit().click()
    detailsOfWitnessesPage.saveAndContinue().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.start(201))
    })
  })
  context('submitted edit - reporter or reviewer changes evidence', () => {
    it('should show the witnesses page with no witnesses added to begin with', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)

      detailsOfWitnessesPage.noWitnessesP1().should('exist')
      detailsOfWitnessesPage.noWitnessesP2().should('exist')
      detailsOfWitnessesPage.addWitnessButton().should('exist')
      detailsOfWitnessesPage.saveAndContinue().should('exist')
      detailsOfWitnessesPage.exitButton().should('exist')
      detailsOfWitnessesPage.witnessesTable().should('not.exist')
    })
    it('should show witnesses when there are some on the draft', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
      detailsOfWitnessesPage
        .witnessesTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Role')
        })
      detailsOfWitnessesPage
        .witnessesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Lastname, Firstname')
          expect($data.get(1).innerText).to.contain('Prison officer')
          expect($data.get(2).innerText).to.contain('Remove')
          expect($data.get(3).innerText).to.contain('Lastname, Firstname')
          expect($data.get(4).innerText).to.contain('None')
          expect($data.get(5).innerText).to.contain('Remove')
        })
    })
    it('should remove the correct witness if the remove link is used (first)', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.removeLink(1).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.submittedEditModified(23456))
        expect(loc.search).to.eq(`?delete=1`)
      })
      detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
      detailsOfWitnessesPage
        .witnessesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Lastname, Firstname')
          expect($data.get(1).innerText).to.contain('None')
        })
    })
    it('should show any witnesses added to the session in the table', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.witnessesTable().should('not.exist')
      detailsOfWitnessesPage.addWitnessButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.add(12345))
      })
      detailsOfWitnessesPage.addWitnessType().find('input[value="OTHER_PERSON"]').check()
      detailsOfWitnessesPage.witnessOtherNameInput().type('Jake Peters')
      detailsOfWitnessesPage.addWitnessSubmit().click()
      detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 2) // This includes the header row plus the Witness we just added
      detailsOfWitnessesPage
        .witnessesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Peters, Jake')
          expect($data.get(0).innerText).to.not.contain('None')
        })
    })
    it('should not show the remove link for witnesses that the current user did not add', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          34567
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(34567)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.witnessesTable().find('tr').should('have.length', 5)
      detailsOfWitnessesPage
        .witnessesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Lastname, Firstname')
          expect($data.get(1).innerText).to.contain('Prison officer')
          expect($data.get(3).innerText).to.contain('Prison, Digital')
          expect($data.get(4).innerText).to.contain('None')
          expect($data.get(6).innerText).to.contain('Lastname, Firstname')
          expect($data.get(7).innerText).to.contain("Member of staff who's not a prison officer")
        })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reporter', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          34567
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(34567)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(34567))
      })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reviewer', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfWitnesses.urls.submittedEdit(
          34567
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review(34567)}`
      )
      const detailsOfWitnessesPage: DetailsOfWitnesses = Page.verifyOnPage(DetailsOfWitnesses)
      detailsOfWitnessesPage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(34567))
      })
    })
  })
})
