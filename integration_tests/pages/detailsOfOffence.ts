import Page, { PageElement } from './page'

export default class DetailsOfOffence extends Page {
  constructor() {
    super('Offence details')
  }

  prisonerNameDiv = (): PageElement => cy.get('[data-qa="playback-offender-name"]')

  offenceSection = (offenceIndex: number): PageElement => cy.get(`[data-qa="offence-broke-section-${offenceIndex}"]`)

  questionAnswerSection = (offenceIndex: number): PageElement =>
    cy.get(`[data-qa="question-answer-section-${offenceIndex}"]`)

  questionAnswerSectionQuestion = (offenceIndex: number, questionIndex: number): PageElement =>
    this.questionAnswerSection(offenceIndex).get(`[data-qa="question-${questionIndex}"]`)

  questionAnswerSectionAnswer = (offenceIndex: number, answerIndex: number): PageElement =>
    this.questionAnswerSection(offenceIndex).get(`[data-qa="answer-${answerIndex}"]`)

  deleteLink = (offenceIndex: number): PageElement => cy.get(`[data-qa="delete-${offenceIndex}"]`)

  addAnotherOffence = (): PageElement => cy.get(`[data-qa="add-another-offence"]`)
}
