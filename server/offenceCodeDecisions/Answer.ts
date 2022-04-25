import { getProcessedText, PlaceholderValues } from './Placeholder'
// eslint-disable-next-line import/no-cycle
import { Question } from './Question'
import { IncidentRole } from '../incidentRole/IncidentRole'

export class Answer {
  private readonly answerText: string

  private readonly answerReplayText: string

  private answerOffenceCode: number

  private childQuestion: Question

  private parentQuestion: Question

  private answerType: AnswerType = AnswerType.RADIO_SELECTION_ONLY

  constructor(text: string | [string, string]) {
    if (typeof text === 'string') {
      this.answerText = text
    } else if (text instanceof Array) {
      ;[this.answerText, this.answerReplayText] = text
    }
  }

  id() {
    // We should always have a parent but if we don't we assume the parent would have id 1 and be the root.
    const parentId = this.getParentQuestion()?.id() || 1
    const index = (this.getParentQuestion()?.getChildAnswers().indexOf(this) || 0) + 1
    return `${parentId}-${index}`
  }

  child(child: Question) {
    this.childQuestion = child
    child.parent(this)
    return this
  }

  parent(parent: Question) {
    this.parentQuestion = parent
    return this
  }

  type(answerType: AnswerType) {
    this.answerType = answerType
    return this
  }

  offenceCode(offenceCode: number) {
    this.answerOffenceCode = offenceCode
    return this
  }

  getType() {
    return this.answerType
  }

  getText() {
    return this.answerText
  }

  getOffenceCode() {
    return this.answerOffenceCode
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerText, placeholderValues)
  }

  getProcessedReplayText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerReplayText || this.answerText, placeholderValues)
  }

  getParentQuestion() {
    return this.parentQuestion
  }

  getChildQuestion() {
    return this.childQuestion
  }

  allCodes(): number[] {
    const childAnswers = this.getChildQuestion()?.getChildAnswers()
    const childCodes = childAnswers ? [].concat(...childAnswers.map(a => a.allCodes())) : []
    if (this.getOffenceCode()) {
      childCodes.push(this.getOffenceCode())
    }
    return childCodes.sort()
  }

  getQuestionsAndAnswersToGetHere(): { question: Question; answer: Answer }[] {
    let questionsAndAnswers = [] as { question: Question; answer: Answer }[]
    if (this.getParentQuestion().getParentAnswer()) {
      questionsAndAnswers = questionsAndAnswers.concat(
        this.getParentQuestion().getParentAnswer().getQuestionsAndAnswersToGetHere()
      )
    }
    questionsAndAnswers.push({ question: this.getParentQuestion(), answer: this })
    return questionsAndAnswers
  }

  getProcessedQuestionsAndAnswersToGetHere(
    placeHolderValues: PlaceholderValues,
    incidentRole: IncidentRole
  ): { question: string; answer: string }[] {
    return this.getQuestionsAndAnswersToGetHere().map(questionAndAnswer => {
      return {
        question: questionAndAnswer.question.getTitle().getProcessedText(placeHolderValues, incidentRole),
        answer: questionAndAnswer.answer.getProcessedReplayText(placeHolderValues),
      }
    })
  }

  findAnswerBy(fn: (d: Answer) => boolean): Answer {
    const matching = this.matchingAnswers(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (d: Answer) => boolean): Answer[] {
    const childAnswers = this.getChildQuestion()?.getChildAnswers()
    const childMatches = childAnswers ? [].concat(...childAnswers.map(a => a.matchingAnswers(fn))) : []
    if (fn(this)) {
      childMatches.push(this)
    }
    return childMatches
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Answer Id: ${this.id()}`
    if (this.getText()) {
      output = `${output}\r\n${padding}Answer: ${this.getText()}`
    }
    if (this.getOffenceCode()) {
      output = `${output}\r\n${padding}Offence Code: ${this.getOffenceCode()}`
    }
    if (this.getChildQuestion()) {
      output = `${output}\r\n${this.getChildQuestion().toString(indent + 4)}`
    }
    return output
  }

  private uniqueOrThrow<T>(list: T[]): T {
    if (list.length === 1) {
      return list[0]
    }
    if (list.length !== 0) {
      throw new Error(`Duplicates found in answer ${this.id()}`)
    }
    return null
  }
}

export function answer(text: string | [string, string]) {
  return new Answer(text)
}

// eslint-disable-next-line no-shadow
export enum AnswerType {
  RADIO_SELECTION_ONLY = 'RADIO_SELECTION_ONLY',
  PRISONER = 'PRISONER',
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  OTHER_PERSON = 'OTHER_PERSON',
}
