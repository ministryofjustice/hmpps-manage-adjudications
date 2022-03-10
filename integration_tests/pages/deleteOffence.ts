import Page, { PageElement } from './page'

export default class DeleteOffence extends Page {
  constructor() {
    super('Do you want to delete this offence?')
  }

  questionAnswerSection = (offenceIndex: number): PageElement =>
    cy.get(`[data-qa="question-answer-section-${offenceIndex}"]`)

  questionAnswerSectionQuestion = (offenceIndex: number, questionIndex: number): PageElement =>
    this.questionAnswerSection(offenceIndex).get(`[data-qa="question-${questionIndex}"]`)

  questionAnswerSectionAnswer = (offenceIndex: number, answerIndex: number): PageElement =>
    this.questionAnswerSection(offenceIndex).get(`[data-qa="answer-${answerIndex}"]`)

  noRadio = (): PageElement => cy.get('[data-qa="no-radio"]')

  yesRadio = (): PageElement => cy.get('[data-qa="yes-radio"]')

  confirm = (): PageElement => cy.get('[data-qa="delete-offence-submit"]')

  form = (): PageElement => cy.get('[data-qa="delete-offence-form"]')
}
