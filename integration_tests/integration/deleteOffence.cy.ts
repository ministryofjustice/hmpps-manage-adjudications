import DetailsOfOffence from '../pages/detailsOfOffence'
import Page from '../pages/page'
import DeleteOffence from '../pages/deleteOffence'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    // Draft with saved offences
    cy.task('stubGetDraftAdjudication', {
      id: 300,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 300,
          prisonerNumber: 'G6415GD',
          offenceDetails: {
            offenceCode: 1001,
            offenceRule: {
              paragraphNumber: '1',
              paragraphDescription: 'Commits any assault',
            },
            victimPrisonersNumber: 'G5512G',
          },
        }),
      },
    })

    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
  })

  it('Go to the delete offence page', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    detailsOfOffencePage.deleteLink(1).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
  })

  it('Go to the delete offence page and get a validation failure', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.deleteLink(1).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.confirm().click()
    deleteOffence.form().contains('Select yes if you want to remove this offence')
  })

  it('Go to the delete offence page and select yes', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSection(1).should('exist')
    detailsOfOffencePage.deleteLink(1).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.yesRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffencePage.checkOnPage()
    detailsOfOffencePage.questionAnswerSection(1).should('not.exist')
  })

  it('Go to the delete offence page and select no', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSection(1).should('exist')
    detailsOfOffencePage.deleteLink(1).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.noRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffencePage.checkOnPage()
    detailsOfOffencePage.questionAnswerSection(1).should('exist')
  })
})
