import { getProcessedText, PlaceholderValues } from './Placeholder'
// eslint-disable-next-line import/no-cycle
import { Decision, DecisionType } from './Decision'

export class Answer {
  private readonly answerText: string

  private readonly answerReplayText: string

  private answerOffenceCode: number

  private answerChild: Decision

  private answerParent: Decision

  private answerType: DecisionType = DecisionType.RADIO_SELECTION_ONLY

  constructor(text: string | [string, string]) {
    if (typeof text === 'string') {
      this.answerText = text
    } else if (text instanceof Array) {
      ;[this.answerText, this.answerReplayText] = text
    }
  }

  id() {
    const parentId = this.getParentDecision().id()
    const index = this.getParentDecision().getChildAnswers().indexOf(this)
    return `${parentId}:${index}`
  }

  child(child: Decision) {
    this.answerChild = child
    child.parent(this)
    return this
  }

  parent(parent: Decision) {
    this.answerParent = parent
    return this
  }

  type(answerType: DecisionType) {
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

  getParent() {
    return this.answerChild
  }

  getParentDecision() {
    return this.answerParent
  }

  getChild() {
    return this.answerChild
  }

  getChildDecision() {
    return this.answerChild
  }

  allCodes(): Array<number> {
    const childAnswers = this.getChildDecision()?.getChildAnswers()
    const childCodes = childAnswers ? [].concat(...childAnswers.map(a => a.allCodes())) : []
    if (this.getOffenceCode()) {
      childCodes.push(this.getOffenceCode())
    }
    return childCodes.sort()
  }

  getQuestionsAndAnswersToGetHere(): Array<{ question: Decision; answer: Answer }> {
    let questionsAndAnswers = [] as { question: Decision; answer: Answer }[]
    if (this.getParentDecision().getParentAnswer()) {
      questionsAndAnswers = questionsAndAnswers.concat(
        this.getParentDecision().getParent().getQuestionsAndAnswersToGetHere()
      )
    }
    questionsAndAnswers.push({ question: this.getParentDecision(), answer: this })
    return questionsAndAnswers
  }

  findAnswerBy(fn: (d: Answer) => boolean): Answer {
    const matching = this.matchingAnswer(fn)
    if (matching.length !== 0) {
      return matching[0]
    }
    return null
  }

  matchingAnswer(fn: (d: Answer) => boolean): Array<Answer> {
    const childAnswers = this.getChildDecision()?.getChildAnswers()
    const childMatches = childAnswers ? [].concat(...childAnswers.map(a => a.matchingAnswer(fn))) : []
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
    if (this.getChildDecision()) {
      output = `${output}\r\n${this.getChildDecision().toString(indent + 4)}`
    }
    return output
  }
}

export function answer(text: string | [string, string]) {
  return new Answer(text)
}
