import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfDamages from '../pages/detailsOfDamages'
import { DamageCode, DamageDetails } from '../../server/data/DraftAdjudicationResult'

const damagesList = [
  {
    code: DamageCode.REDECORATION,
    details: 'Wallpaper ripped',
    reporter: 'TESTER_GEN',
  },
  {
    code: DamageCode.REPLACE_AN_ITEM,
    details: 'Rug torn',
    reporter: 'TESTER_GEN',
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
      damages,
    },
  }
}

const prisonerDetails = {
  offenderNo: 'G6415GD',
  firstName: 'JOHN',
  lastName: 'SMITH',
  assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
}

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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails,
    })
  })
  it('should show the damages page with no damages added to begin with', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)

    DetailsOfDamagePage.noDamagesP1().should('exist')
    DetailsOfDamagePage.noDamagesP2().should('exist')
    DetailsOfDamagePage.addDamagesButton().should('exist')
    DetailsOfDamagePage.saveAndContinue().should('exist')
    DetailsOfDamagePage.exitButton().should('exist')
    DetailsOfDamagePage.damagesTable().should('not.exist')
  })
  it('should show damages when there are some on the draft', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.damagesTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    DetailsOfDamagePage.damagesTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Type of repair needed')
        expect($headings.get(1).innerText).to.contain('Description of damage')
      })
    DetailsOfDamagePage.damagesTable()
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
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.removeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.modified(201))
      expect(loc.search).to.eq(`?delete=1`)
    })
    DetailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    DetailsOfDamagePage.damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Replacing an item')
        expect($data.get(1).innerText).to.contain('Rug torn')
      })
  })
  it('should remove the correct damage if the remove link is used (second damage)', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.removeLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.modified(201))
      expect(loc.search).to.eq(`?delete=2`)
    })
    DetailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row and one data row
    DetailsOfDamagePage.damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Redecoration')
        expect($data.get(1).innerText).to.contain('Wallpaper ripped')
      })
  })
  it('should remove both damages, remove table and show correct content', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(201))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.removeLink(1).click() // Removes first damage in table
    DetailsOfDamagePage.removeLink(1).click() // First damage already removed and so second damage is now the first damage listed in table
    DetailsOfDamagePage.damagesTable().should('not.exist')
    DetailsOfDamagePage.noDamagesP1().should('exist')
    DetailsOfDamagePage.noDamagesP2().should('exist')
  })
  it('should take user to the task list if they exit', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(200))
    })
  })
  it('should take user to the add damages list if they click the add damages button', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.addDamagesButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.add(200))
    })
  })
  it('should show any damages added to the session in the table', () => {
    cy.visit(adjudicationUrls.detailsOfDamages.urls.start(200))
    const DetailsOfDamagePage: DetailsOfDamages = Page.verifyOnPage(DetailsOfDamages)
    DetailsOfDamagePage.damagesTable().should('not.exist')
    DetailsOfDamagePage.addDamagesButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.add(200))
    })
    DetailsOfDamagePage.addDamageType().find('input[value="ELECTRICAL_REPAIR"]').check()
    DetailsOfDamagePage.addDamageDescription().type('Plug socket broken')
    DetailsOfDamagePage.addDamageSubmit().click()
    DetailsOfDamagePage.damagesTable().find('tr').should('have.length', 2) // This includes the header row plus the damage we just added
    DetailsOfDamagePage.damagesTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Electrical')
        expect($data.get(0).innerText).to.not.contain('Electrical repair')
        expect($data.get(1).innerText).to.contain('Plug socket broken')
        expect($data.get(2).innerText).to.contain('Remove')
      })
  })
})
