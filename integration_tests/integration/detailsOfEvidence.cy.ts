import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfEvidence from '../pages/detailsOfEvidence'
import { DamageCode, EvidenceCode, EvidenceDetails } from '../../server/data/DraftAdjudicationResult'

const evidenceList = [
  {
    code: EvidenceCode.BAGGED_AND_TAGGED,
    details: 'Bagged evidence',
    reporter: 'USER1',
    identifier: 'JO345',
  },
  {
    code: EvidenceCode.CCTV,
    details: 'Video of the prisoner doing the thing',
    reporter: 'USER1',
  },
  {
    code: EvidenceCode.PHOTO,
    details: 'A photo of the prisoner doing the thing',
    reporter: 'USER1',
  },
]

const evidenceListMultiUser = [
  {
    code: EvidenceCode.BAGGED_AND_TAGGED,
    details: 'some details here',
    reporter: 'USER2',
    identifier: 'JO345',
  },
  {
    code: EvidenceCode.CCTV,
    details: 'some details here',
    reporter: 'USER1',
  },
  {
    code: EvidenceCode.PHOTO,
    details: 'some details here',
    reporter: 'USER2',
  },
  {
    code: EvidenceCode.BODY_WORN_CAMERA,
    details: 'some details here',
    reporter: 'USER1',
    identifier: 'BWC: 123456',
  },
]

const draftAdjudication = (id: number, evidence: EvidenceDetails[]) => {
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
      damages: [
        {
          code: DamageCode.REDECORATION,
          details: 'Wallpaper ripped',
          reporter: 'USER1',
        },
      ],
      evidence,
    },
  }
}

const prisonerDetails = {
  offenderNo: 'G6415GD',
  firstName: 'JOHN',
  lastName: 'SMITH',
  assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
}

context('Details of evidence', () => {
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
      response: draftAdjudication(201, evidenceList),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 202,
      response: draftAdjudication(202, evidenceListMultiUser),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails,
    })
  })
  it('should show the evidence page with no evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(200))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)

    DetailsOfEvidencePage.noEvidence().should('exist')
    DetailsOfEvidencePage.addEvidenceButton().should('exist')
    DetailsOfEvidencePage.saveAndContinue().should('exist')
    DetailsOfEvidencePage.exitButton().should('exist')
    DetailsOfEvidencePage.photoVideoTable().should('not.exist')
    DetailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
  })
  it('should show evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.noEvidence().should('not.exist')
    DetailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    DetailsOfEvidencePage.photoVideoTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Type')
        expect($headings.get(1).innerText).to.contain('Description')
      })
    DetailsOfEvidencePage.photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('CCTV')
        expect($data.get(1).innerText).to.contain('Video of the prisoner doing the thing')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Photo')
        expect($data.get(4).innerText).to.contain('A photo of the prisoner doing the thing')
        expect($data.get(5).innerText).to.contain('Remove')
      })
    DetailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 2) // This includes the header row plus one data row
    DetailsOfEvidencePage.baggedAndTaggedTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Tag Number')
        expect($headings.get(1).innerText).to.contain('Description')
      })
    DetailsOfEvidencePage.baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('JO345')
        expect($data.get(1).innerText).to.contain('Bagged evidence')
        expect($data.get(2).innerText).to.contain('Remove')
      })
  })
  it('should remove the correct piece of evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.noPhotoVideoEvidence().should('not.exist')
    DetailsOfEvidencePage.noBaggedAndTaggedEvidence().should('not.exist')

    DetailsOfEvidencePage.removeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.modified(201))
      expect(loc.search).to.eq(`?delete=1`)
    })
    DetailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 2)
    DetailsOfEvidencePage.photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Photo')
        expect($data.get(1).innerText).to.contain('A photo of the prisoner doing the thing')
      })
    DetailsOfEvidencePage.removeLink(1).click()
    DetailsOfEvidencePage.photoVideoTable().should('not.exist')
    DetailsOfEvidencePage.noPhotoVideoEvidence().should('contain', 'None')
    DetailsOfEvidencePage.removeLink(1001).click()
    DetailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
    DetailsOfEvidencePage.noBaggedAndTaggedEvidence().should('contain', 'None')
  })
  it('should take user to the add evidence page if they click the button, and show the new evidence in the correct tables on the details page on return', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(201))
    })
    DetailsOfEvidencePage.addEvidenceType().find('input[value="PHOTO"]').check()
    DetailsOfEvidencePage.addEvidenceDescription().type(
      'A photo of the prisoner stealing the keys from behind a prison officers back'
    )
    DetailsOfEvidencePage.addEvidenceSubmit().click()
    DetailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 4)
    DetailsOfEvidencePage.photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('CCTV')
        expect($data.get(1).innerText).to.contain('Video of the prisoner doing the thing')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Photo')
        expect($data.get(4).innerText).to.contain('A photo of the prisoner doing the thing')
        expect($data.get(5).innerText).to.contain('Remove')
        expect($data.get(6).innerText).to.contain('Photo')
        expect($data.get(7).innerText).to.contain(
          'A photo of the prisoner stealing the keys from behind a prison officers back'
        )
        expect($data.get(8).innerText).to.contain('Remove')
      })
    DetailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(201))
    })
    DetailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    DetailsOfEvidencePage.addTagNumber().type('JO1234')
    DetailsOfEvidencePage.addEvidenceDescription().type('The hook used to steal the keys')
    DetailsOfEvidencePage.addEvidenceSubmit().click()
    DetailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 3)
    DetailsOfEvidencePage.baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(3).innerText).to.contain('JO1234')
        expect($data.get(4).innerText).to.contain('The hook used to steal the keys')
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should not show the remove link for evidence the current user did not add', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(5).innerText).to.not.contain('Remove')
        expect($data.get(8).innerText).to.contain('Remove')
      })
    DetailsOfEvidencePage.baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
  })
  it('should contain the remove link for an evidence the current user adds', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.addEvidenceButton().click()
    DetailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    DetailsOfEvidencePage.addTagNumber().type('JO1234')
    DetailsOfEvidencePage.addEvidenceDescription().type('A knife')
    DetailsOfEvidencePage.addEvidenceSubmit().click()
    DetailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 3)
    DetailsOfEvidencePage.baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should exit to the task list page if the user clicks the exit button', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const DetailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    DetailsOfEvidencePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(202))
    })
  })
})
