import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DetailsOfEvidence from '../pages/detailsOfEvidence'
import { DamageCode, EvidenceCode, EvidenceDetails } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const evidenceList = [
  testData.singleEvidence({ details: 'Bagged evidence', identifier: 'JO345', reporter: 'USER1' }),
  testData.singleEvidence({
    code: EvidenceCode.CCTV,
    details: 'Video of the prisoner doing the thing',
    reporter: 'USER1',
  }),
  testData.singleEvidence({
    code: EvidenceCode.PHOTO,
    details: 'A photo of the prisoner doing the thing',
    reporter: 'USER1',
  }),
]

const evidenceListMultiUser = [
  testData.singleEvidence({ reporter: 'USER2', identifier: 'JO345' }),
  testData.singleEvidence({ code: EvidenceCode.CCTV, reporter: 'USER1' }),
  testData.singleEvidence({ code: EvidenceCode.PHOTO, reporter: 'USER2' }),
  testData.singleEvidence({ code: EvidenceCode.BODY_WORN_CAMERA, identifier: 'BWC: 123456', reporter: 'USER1' }),
]

const draftAdjudication = (id: number, evidence: EvidenceDetails[]) => {
  return {
    draftAdjudication: testData.draftAdjudication({
      id,
      evidence,
      prisonerNumber: 'G6415GD',
      damages: [testData.singleDamage({ code: DamageCode.REDECORATION, details: 'Wallpaper ripped' })],
    }),
  }
}

const reportedAdjudication = (chargeNumber: string, evidence: EvidenceDetails[]) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      evidence,
      prisonerNumber: 'G6415GD',
    }),
  }
}

const prisonerDetails = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'John',
  lastName: 'Smith',
  assignedLivingUnitDesc: '1-2-015',
})

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
    cy.task('stubSaveEvidenceDetails', {
      chargeNumber: '201',
      response: draftAdjudication(201, evidenceList),
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 12345,
      response: reportedAdjudication('12345', null),
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 23456,
      response: reportedAdjudication('23456', evidenceList),
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 34567,
      response: reportedAdjudication('34567', evidenceListMultiUser),
    })
  })
  it('should show the evidence page with no evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(200))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)

    detailsOfEvidencePage.noEvidence().should('exist')
    detailsOfEvidencePage.addEvidenceButton().should('exist')
    detailsOfEvidencePage.saveAndContinue().should('exist')
    detailsOfEvidencePage.exitButton().should('exist')
    detailsOfEvidencePage.photoVideoTable().should('not.exist')
    detailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
  })
  it('should show evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.noEvidence().should('not.exist')
    detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
    detailsOfEvidencePage
      .photoVideoTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Type')
        expect($headings.get(1).innerText).to.contain('Description')
      })
    detailsOfEvidencePage
      .photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('CCTV')
        expect($data.get(1).innerText).to.contain('Video of the prisoner doing the thing')
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(3).innerText).to.contain('Photo')
        expect($data.get(4).innerText).to.contain('A photo of the prisoner doing the thing')
        expect($data.get(5).innerText).to.contain('Remove')
      })
    detailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 2) // This includes the header row plus one data row
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Seal number')
        expect($headings.get(1).innerText).to.contain('Description')
      })
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('JO345')
        expect($data.get(1).innerText).to.contain('Bagged evidence')
        expect($data.get(2).innerText).to.contain('Remove')
      })
  })
  it('should submit the evidence and move to the next page', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(201))
    })
    detailsOfEvidencePage.addEvidenceType().find('input[value="PHOTO"]').check()
    detailsOfEvidencePage
      .addEvidenceDescription()
      .type('A photo of the prisoner stealing the keys from behind a prison officers back')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage.saveAndContinue().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.start(201))
    })
  })
  it('should remove the correct piece of evidence', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.noPhotoVideoEvidence().should('not.exist')
    detailsOfEvidencePage.noBaggedAndTaggedEvidence().should('not.exist')

    detailsOfEvidencePage.removeLink(false, 1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.modified(201))
      expect(loc.search).to.eq(`?type=CCTV&delete=1`)
    })
    detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 2)
    detailsOfEvidencePage
      .photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Photo')
        expect($data.get(1).innerText).to.contain('A photo of the prisoner doing the thing')
      })
    detailsOfEvidencePage.removeLink(false, 1).click()
    detailsOfEvidencePage.photoVideoTable().should('not.exist')
    detailsOfEvidencePage.noPhotoVideoEvidence().should('contain', 'None')
    detailsOfEvidencePage.removeLink(true, 1).click()
    detailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
    detailsOfEvidencePage.noBaggedAndTaggedEvidence().should('contain', 'None')
  })
  it('should take user to the add evidence page if they click the button, and show the new evidence in the correct tables on the details page on return', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(201))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(201))
    })
    detailsOfEvidencePage.addEvidenceType().find('input[value="PHOTO"]').check()
    detailsOfEvidencePage
      .addEvidenceDescription()
      .type('A photo of the prisoner stealing the keys from behind a prison officers back')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 4)
    detailsOfEvidencePage
      .photoVideoTable()
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
    detailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(201))
    })
    detailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    detailsOfEvidencePage.addSealNumber().type('JO1234')
    detailsOfEvidencePage.addEvidenceDescription().type('The hook used to steal the keys')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 3)
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(3).innerText).to.contain('JO1234')
        expect($data.get(4).innerText).to.contain('The hook used to steal the keys')
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should save the correct identifier if the user enters both body worn camera and bagged and tagged ids - BWC added first and then radio changed to BAT', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(200))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(200))
    })
    detailsOfEvidencePage.addEvidenceType().find('input[value="BODY_WORN_CAMERA"]').check()
    detailsOfEvidencePage.addBWCNumber().type('BWC123')
    detailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    detailsOfEvidencePage.addSealNumber().type('SealNo123')
    detailsOfEvidencePage.addEvidenceDescription().type('The hook used to steal the keys')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('SealNo123')
      })
  })
  it('should save the correct identifier if the user enters both body worn camera and bagged and tagged ids - BAT added first and then radio changed to BWC', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(200))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.addEvidenceButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(200))
    })
    detailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    detailsOfEvidencePage.addSealNumber().type('SealNo123')
    detailsOfEvidencePage.addEvidenceType().find('input[value="BODY_WORN_CAMERA"]').check()
    detailsOfEvidencePage.addBWCNumber().type('BWC123')
    detailsOfEvidencePage.addEvidenceDescription().type('A video of the prisoner stealing keys')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage
      .photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(1).innerText).to.contain('BWC123 - A video of the prisoner stealing keys')
      })
  })
  it('should not show the remove link for evidence the current user did not add', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage
      .photoVideoTable()
      .find('td')
      .then($data => {
        expect($data.get(2).innerText).to.contain('Remove')
        expect($data.get(5).innerText).to.not.contain('Remove')
        expect($data.get(8).innerText).to.contain('Remove')
      })
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(2).innerText).to.not.contain('Remove')
      })
  })
  it('should contain the remove link for an evidence the current user adds', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.addEvidenceButton().click()
    detailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
    detailsOfEvidencePage.addSealNumber().type('JO1234')
    detailsOfEvidencePage.addEvidenceDescription().type('A knife')
    detailsOfEvidencePage.addEvidenceSubmit().click()
    detailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 3)
    detailsOfEvidencePage
      .baggedAndTaggedTable()
      .find('td')
      .then($data => {
        expect($data.get(5).innerText).to.contain('Remove')
      })
  })
  it('should exit to the task list page if the user clicks the exit button', () => {
    cy.visit(adjudicationUrls.detailsOfEvidence.urls.start(202))
    const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
    detailsOfEvidencePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(202))
    })
  })
  context('submitted edit - reporter or reviewer changes evidence', () => {
    it('should show the evidence page with no evidence', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)

      detailsOfEvidencePage.noEvidence().should('exist')
      detailsOfEvidencePage.addEvidenceButton().should('exist')
      detailsOfEvidencePage.saveAndContinue().should('exist')
      detailsOfEvidencePage.exitButton().should('exist')
      detailsOfEvidencePage.photoVideoTable().should('not.exist')
      detailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
    })
    it('should show evidence', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage.noEvidence().should('not.exist')
      detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 3) // This includes the header row plus two data rows
      detailsOfEvidencePage
        .photoVideoTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Type')
          expect($headings.get(1).innerText).to.contain('Description')
        })
      detailsOfEvidencePage
        .photoVideoTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('CCTV')
          expect($data.get(1).innerText).to.contain('Video of the prisoner doing the thing')
          expect($data.get(2).innerText).to.contain('Remove')
          expect($data.get(3).innerText).to.contain('Photo')
          expect($data.get(4).innerText).to.contain('A photo of the prisoner doing the thing')
          expect($data.get(5).innerText).to.contain('Remove')
        })
      detailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 2) // This includes the header row plus one data row
      detailsOfEvidencePage
        .baggedAndTaggedTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Seal number')
          expect($headings.get(1).innerText).to.contain('Description')
        })
      detailsOfEvidencePage
        .baggedAndTaggedTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('JO345')
          expect($data.get(1).innerText).to.contain('Bagged evidence')
          expect($data.get(2).innerText).to.contain('Remove')
        })
    })
    it('should remove the correct piece of evidence', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage.noPhotoVideoEvidence().should('not.exist')
      detailsOfEvidencePage.noBaggedAndTaggedEvidence().should('not.exist')

      detailsOfEvidencePage.removeLink(false, 1).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.submittedEditModified(23456))
        expect(loc.search).to.eq(`?type=CCTV&delete=1`)
      })
      detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 2)
      detailsOfEvidencePage
        .photoVideoTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Photo')
          expect($data.get(1).innerText).to.contain('A photo of the prisoner doing the thing')
        })
      detailsOfEvidencePage.removeLink(false, 1).click()
      detailsOfEvidencePage.photoVideoTable().should('not.exist')
      detailsOfEvidencePage.noPhotoVideoEvidence().should('contain', 'None')
      detailsOfEvidencePage.removeLink(true, 1).click()
      detailsOfEvidencePage.baggedAndTaggedTable().should('not.exist')
      detailsOfEvidencePage.noBaggedAndTaggedEvidence().should('contain', 'None')
    })
    it('should take user to the add evidence page if they click the button, and show the new evidence in the correct tables on the details page on return', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          23456
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(23456)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage.addEvidenceButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(23456))
      })
      detailsOfEvidencePage.addEvidenceType().find('input[value="PHOTO"]').check()
      detailsOfEvidencePage
        .addEvidenceDescription()
        .type('A photo of the prisoner stealing the keys from behind a prison officers back')
      detailsOfEvidencePage.addEvidenceSubmit().click()
      detailsOfEvidencePage.photoVideoTable().find('tr').should('have.length', 4)
      detailsOfEvidencePage
        .photoVideoTable()
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
      detailsOfEvidencePage.addEvidenceButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.add(23456))
      })
      detailsOfEvidencePage.addEvidenceType().find('input[value="BAGGED_AND_TAGGED"]').check()
      detailsOfEvidencePage.addSealNumber().type('JO1234')
      detailsOfEvidencePage.addEvidenceDescription().type('The hook used to steal the keys')
      detailsOfEvidencePage.addEvidenceSubmit().click()
      detailsOfEvidencePage.baggedAndTaggedTable().find('tr').should('have.length', 3)
      detailsOfEvidencePage
        .baggedAndTaggedTable()
        .find('td')
        .then($data => {
          expect($data.get(3).innerText).to.contain('JO1234')
          expect($data.get(4).innerText).to.contain('The hook used to steal the keys')
          expect($data.get(5).innerText).to.contain('Remove')
        })
    })
    it('should not show the remove link for evidence the current user did not add', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          34567
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(34567)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage
        .photoVideoTable()
        .find('td')
        .then($data => {
          expect($data.get(2).innerText).to.contain('Remove')
          expect($data.get(5).innerText).to.not.contain('Remove')
          expect($data.get(8).innerText).to.contain('Remove')
        })
      detailsOfEvidencePage
        .baggedAndTaggedTable()
        .find('td')
        .then($data => {
          expect($data.get(2).innerText).to.not.contain('Remove')
        })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reporter', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(12345)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(12345))
      })
    })
    it('should return to the referrer stored in the session if the exit button is clicked - reviewer', () => {
      cy.visit(
        `${adjudicationUrls.detailsOfEvidence.urls.submittedEdit(
          12345
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review(12345)}`
      )
      const detailsOfEvidencePage: DetailsOfEvidence = Page.verifyOnPage(DetailsOfEvidence)
      detailsOfEvidencePage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(12345))
      })
    })
  })
})
