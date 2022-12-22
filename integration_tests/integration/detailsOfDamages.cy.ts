import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfDamages from '../pages/detailsOfDamages'
import { DamageCode, DamageDetails, PrisonerGender } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const damagesList = [
  {
    code: DamageCode.REDECORATION,
    details: 'Wallpaper ripped',
    reporter: 'USER1',
  },
  {
    code: DamageCode.REPLACE_AN_ITEM,
    details: 'Rug torn',
    reporter: 'USER1',
  },
]

const damagesListMultiUser = [
  {
    code: DamageCode.REDECORATION,
    details: 'Wallpaper ripped',
    reporter: 'USER1',
  },
  {
    code: DamageCode.ELECTRICAL_REPAIR,
    details: 'Plug socket broken',
    reporter: 'USER1',
  },
  {
    code: DamageCode.REPLACE_AN_ITEM,
    details: 'Chair broken',
    reporter: 'USER2',
  },
  {
    code: DamageCode.CLEANING,
    details: 'Walls need cleaning',
    reporter: 'USER1',
  },
]

const draftAdjudication = (id: number, damages: DamageDetails[]) => {
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
      offenceDetails: {
        offenceCode: 1001,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G5512G',
      },
      damages,
    },
  }
}

const reportedAdjudication = (adjudicationNumber: number, damages: DamageDetails[]) => {
  return {
    reportedAdjudication: {
      adjudicationNumber,
      incidentDetails: {
        dateTimeOfIncident: '2021-11-03T13:10:00',
        handoverDeadline: '2021-11-05T13:10:00',
        locationId: 27029,
      },
      prisonerNumber: 'G6415GD',
      gender: PrisonerGender.MALE,
      startedByUserId: 'USER1',
      incidentRole: {
        associatedPrisonersNumber: undefined,
        roleCode: undefined,
      },
      incidentStatement: {
        statement: 'This is my statement',
        completed: true,
      },
      offenceDetails: {
        offenceCode: 1001,
        offenceRule: {
          paragraphNumber: '1',
          paragraphDescription: 'Commits any assault',
        },
        victimPrisonersNumber: 'G5512G',
      },
      damages,
      evidence: [],
      witnesses: [],
    },
  }
}

const prisonerDetails = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'JOHN',
  lastName: 'SMITH',
})

context('Details of damages', () => {
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
      response: draftAdjudication(201, damagesList),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 202,
      response: draftAdjudication(202, damagesListMultiUser),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails,
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: reportedAdjudication(12345, null),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 23456,
      response: reportedAdjudication(23456, damagesList),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 34567,
      response: reportedAdjudication(34567, damagesListMultiUser),
    })
  })
  it('should show the damages page with no damages added to begin with', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)

    detailsOfDamagePage.noDamagesP1().should('exist')
    detailsOfDamagePage.noDamagesP2().should('exist')
    detailsOfDamagePage.addDamagesButton().should('exist')
    detailsOfDamagePage.saveAndContinue().should('exist')
    detailsOfDamagePage.exitButton().should('exist')
    detailsOfDamagePage.damagesTable().should('not.exist')
  })
  it('should show damages when there are some on the draft', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    detailsOfDamagePage
      .damagesTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Type of repair needed')
        expect($headings.get(1).innerText).to.contain('Description of damage')
      })
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Redecoration')
        expect($data.get(1).innerText).to.contain('Wallpaper ripped')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Replacing an item')
        expect($data.get(4).innerText).to.contain('Rug torn')
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should remove the correct damage if the remove link is used (first damage)', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.removeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.modified(201))
      expect(loc.search).to.eq(`?delete=1`)
    })
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Replacing an item')
        expect($data.get(1).innerText).to.contain('Rug torn')
      })
  })
  it('should remove the correct damage if the remove link is used (second damage)', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.removeLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.modified(201))
      expect(loc.search).to.eq(`?delete=2`)
    })
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Redecoration')
        expect($data.get(1).innerText).to.contain('Wallpaper ripped')
      })
  })
  it('should remove both damages, remove table and show correct content', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.removeLink(1).click() // Removes first damage in table
    detailsOfDamagePage.removeLink(1).click() // First damage already removed and so second damage is now the first damage listed in table
    detailsOfDamagePage.damagesTable().should('not.exist')
    detailsOfDamagePage.noDamagesP1().should('exist')
    detailsOfDamagePage.noDamagesP2().should('exist')
  })
  it('should take user to the task list if they exit', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(200))
    })
  })
  it('should take user to the add damages list if they click the add damages button', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.addDamagesButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.add(200))
    })
  })
  it('should show any damages added to the session in the table', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.damagesTable().should('not.exist')
    detailsOfDamagePage.addDamagesButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.add(200))
    })
    detailsOfDamagePage.addDamageType().find('input[value="ELECTRICAL_REPAIR"]').check()
    detailsOfDamagePage.addDamageDescription().type('Plug socket broken')
    detailsOfDamagePage.addDamageSubmit().click()
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row plus the damage we just added
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Electrical')
        expect($data.get(0).innerText).to.not.contain('Electrical repair')
        expect($data.get(1).innerText).to.contain('Plug socket broken')
        expect($data.get(2).innerText).to.contain('Remove')
      })
  })
  it('should not show the remove link for damages that the current user did not add', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(202))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 5) // This includes the header row plus four data rows
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Redecoration')
        expect($data.get(1).innerText).to.contain('Wallpaper ripped')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Electrical')
        expect($data.get(4).innerText).to.contain('Plug socket broken')
        expect($data.get(5).innerText).to.contain('Remove')
        expect($data.get(6).innerText).to.contain('Replacing an item')
        expect($data.get(7).innerText).to.contain('Chair broken')
        expect($data.get(8).innerText).to.not.contain('Remove')
        expect($data.get(9).innerText).to.contain('Cleaning')
        expect($data.get(10).innerText).to.contain('Walls need cleaning')
        expect($data.get(11).innerText).to.contain('Remove')
      })
  })
  it('should show the remove link on a new damage that you just added', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(202))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 5) // This includes the header row plus four data rows
    detailsOfDamagePage.addDamagesButton().click()
    detailsOfDamagePage.addDamageType().find('input[value="ELECTRICAL_REPAIR"]').check()
    detailsOfDamagePage.addDamageDescription().type('Light fitting pulled out')
    detailsOfDamagePage.addDamageSubmit().click()
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(12).innerText).to.contain('Electrical')
        expect($data.get(13).innerText).to.contain('Light fitting pulled out')
        expect($data.get(14).innerText).to.contain('Remove')
      })
  })
  it('should still remove the correct damages when there are damages listed not created by the current user', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(202))
    const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    detailsOfDamagePage.removeLink(2).click() // Removes second damage in table
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(3).innerText).to.not.contain('Electrical')
        expect($data.get(4).innerText).to.not.contain('Plug socket broken')
        expect($data.get(5).innerText).to.not.contain('Remove')
      })
    detailsOfDamagePage.removeLink(1).click() // Removes first damage in table
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.not.contain('Redecoration')
        expect($data.get(1).innerText).to.not.contain('Wallpaper ripped')
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    detailsOfDamagePage.removeLink(2).click() // Removes the final damage in table
    detailsOfDamagePage
      .damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Replacing an item')
        expect($data.get(1).innerText).to.contain('Chair broken')
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
    detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row plus a data rows
  })
  context('submitted edit - reporter or reviewer changes damages', () => {
    it('page items present - no damages', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)

      detailsOfDamagePage.noDamagesP1().should('exist')
      detailsOfDamagePage.noDamagesP2().should('exist')
      detailsOfDamagePage.addDamagesButton().should('exist')
      detailsOfDamagePage.saveAndContinue().should('exist')
      detailsOfDamagePage.exitButton().should('exist')
      detailsOfDamagePage.damagesTable().should('not.exist')
    })
    it('page items present - damages present', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.damagesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
      detailsOfDamagePage
        .damagesTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Type of repair needed')
          expect($headings.get(1).innerText).to.contain('Description of damage')
        })
      detailsOfDamagePage
        .damagesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Redecoration')
          expect($data.get(1).innerText).to.contain('Wallpaper ripped')
          expect($data.get(2).innerText).to.contain('Remove')
          expect($data.get(3).innerText).to.contain('Replacing an item')
          expect($data.get(4).innerText).to.contain('Rug torn')
          expect($data.get(5).innerText).to.contain('Remove')
        })
    })
    it('should remove the correct damage if the remove link is used (first damage)', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review(23456)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.removeLink(1).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEditModified(23456))
        expect(loc.search).to.eq(`?delete=1`)
      })
      detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
      detailsOfDamagePage
        .damagesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Replacing an item')
          expect($data.get(1).innerText).to.contain('Rug torn')
        })
    })
    it('should remove the correct damage if the remove link is used (second damage)', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.removeLink(2).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.submittedEditModified(23456))
        expect(loc.search).to.eq(`?delete=2`)
      })
      detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
      detailsOfDamagePage
        .damagesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Redecoration')
          expect($data.get(1).innerText).to.contain('Wallpaper ripped')
        })
    })
    it('should not show the remove link for damages that the current user did not add', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          34567
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(34567)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.damagesTable().find('tr').should('have.length', 5) // This includes the header row plus four data rows
      detailsOfDamagePage
        .damagesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Redecoration')
          expect($data.get(1).innerText).to.contain('Wallpaper ripped')
          expect($data.get(2).innerText).to.contain('Remove')
          expect($data.get(3).innerText).to.contain('Electrical')
          expect($data.get(4).innerText).to.contain('Plug socket broken')
          expect($data.get(5).innerText).to.contain('Remove')
          expect($data.get(6).innerText).to.contain('Replacing an item')
          expect($data.get(7).innerText).to.contain('Chair broken')
          expect($data.get(8).innerText).to.not.contain('Remove')
          expect($data.get(9).innerText).to.contain('Cleaning')
          expect($data.get(10).innerText).to.contain('Walls need cleaning')
          expect($data.get(11).innerText).to.contain('Remove')
        })
    })
    it('should show any damages added to the session in the table', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review(12345)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.damagesTable().should('not.exist')
      detailsOfDamagePage.addDamagesButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.add(12345))
      })
      detailsOfDamagePage.addDamageType().find('input[value="ELECTRICAL_REPAIR"]').check()
      detailsOfDamagePage.addDamageDescription().type('Plug socket broken')
      detailsOfDamagePage.addDamageSubmit().click()
      detailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row plus the damage we just added
      detailsOfDamagePage
        .damagesTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Electrical')
          expect($data.get(0).innerText).to.not.contain('Electrical repair')
          expect($data.get(1).innerText).to.contain('Plug socket broken')
          expect($data.get(2).innerText).to.contain('Remove')
        })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reporter', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(12345))
      })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reviewer', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfDamages.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review(12345)}`
      )
      const detailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
      detailsOfDamagePage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(12345))
      })
    })
  })
})
