import { getProcessedText, PlaceholderValues } from './Placeholder'
// eslint-disable-next-line import/no-cycle
import Question from './Question'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import { notEmpty } from './Decisions'

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

  // The id is that of the parent question with the answer index appended. There should always be a parent question but
  // if not we assume its id would be 1. Note indexes are 1 based.
  id() {
    const parentId = this.getParentQuestion()?.id() || 1
    const index = (this.getParentQuestion()?.getChildAnswers().indexOf(this) || 0) + 1
    return `${parentId}-${index}`
  }

  child(child: Question): Answer {
    this.childQuestion = child
    child.parent(this)
    return this
  }

  parent(parent: Question): Answer {
    this.parentQuestion = parent
    return this
  }

  type(answerType: AnswerType): Answer {
    this.answerType = answerType
    return this
  }

  offenceCode(offenceCode: number): Answer {
    this.answerOffenceCode = offenceCode
    return this
  }

  getType(): AnswerType {
    return this.answerType
  }

  getText(): string {
    return this.answerText
  }

  getOffenceCode(): number {
    return this.answerOffenceCode
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerText, placeholderValues)
  }

  getProcessedReplayText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerReplayText || this.answerText, placeholderValues)
  }

  getParentQuestion(): Question {
    return this.parentQuestion
  }

  getChildQuestion(): Question {
    return this.childQuestion
  }

  getChildAnswers(): Answer[] {
    return this.getChildQuestion()?.getChildAnswers() || []
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

  findAnswerBy(fn: (answer: Answer) => boolean): Answer {
    const matching = this.matchingAnswers(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (answer: Answer) => boolean): Answer[] {
    const childMatches = []
      .concat(...this.getChildAnswers().map(childAnswer => childAnswer.matchingAnswers(fn)))
      .filter(notEmpty)
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

// eslint-disable-next-line no-shadow
export enum AnswerType {
  RADIO_SELECTION_ONLY = 'RADIO_SELECTION_ONLY',
  PRISONER = 'PRISONER',
  PRISONER_OUTSIDE_ESTABLISHMENT = 'PRISONER_OUTSIDE_ESTABLISHMENT',
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  OTHER_PERSON = 'OTHER_PERSON',
}
