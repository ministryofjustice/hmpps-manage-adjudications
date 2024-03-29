import Title from './Title'
// eslint-disable-next-line import/no-cycle
import { Answer } from './Answer'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import { all, notEmpty } from './Decisions'

export default class Question {
  private parentAnswer: Answer

  private childAnswers: Answer[] = []

  private readonly questionTitle: Title

  private readonly overrideId?: string

  constructor(
    title: Title | string | (readonly (readonly [IncidentRole, string])[] | null),
    overrideId?: string | null
  ) {
    this.overrideId = overrideId
    if (title instanceof Title) {
      this.questionTitle = title
    } else if (typeof title === 'string') {
      this.questionTitle = new Title(title)
    } else {
      this.questionTitle = new Title(title)
    }
  }

  // The id is 1 when this is the top most question otherwise it is that of the parent answer.
  id(): string {
    return this.getParentAnswer()?.id() || this.overrideId || '1'
  }

  parent(parent: Answer) {
    this.parentAnswer = parent
    return this
  }

  child(child: Answer) {
    child.parent(this)
    this.childAnswers.push(child)
    return this
  }

  getTitle() {
    return this.questionTitle
  }

  getChildAnswers() {
    return this.childAnswers
  }

  getParentAnswer() {
    return this.parentAnswer
  }

  allIds(): string[] {
    return this.matchingQuestions(all)
      .map(question => question.id())
      .sort()
  }

  findQuestionById(id: string): Question {
    return this.findQuestionBy(question => question.id() === id)
  }

  findQuestionBy(fn: (question: Question) => boolean): Question {
    const matching = this.matchingQuestions(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingQuestions(fn: (question: Question) => boolean): Question[] {
    const matches = [].concat(
      ...this.getChildAnswers()
        .map(childAnswer => childAnswer.getChildQuestion())
        .filter(childQuestion => !!childQuestion)
        .map(d => d.matchingQuestions(fn))
    )
    if (fn(this)) {
      matches.push(this)
    }
    return matches
  }

  findAnswerBy(fn: (answer: Answer) => boolean): Answer {
    const matching = this.matchingAnswers(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (answer: Answer) => boolean): Answer[] {
    return [].concat(...this.getChildAnswers().map(a => a.matchingAnswers(fn))).filter(notEmpty)
  }

  allCodes(): Array<number> {
    return this.matchingAnswers(answer => !!answer.getOffenceCode()).map(answer => answer.getOffenceCode())
  }

  findAnswerByCode(offenceCode: number): Answer {
    return this.findAnswerBy(answer => answer.getOffenceCode() === offenceCode)
  }

  findAnswerById(id: string): Answer {
    return this.findAnswerBy(answer => answer.id() === id)
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Question Id: ${this.id()}`
    if (this.getTitle()?.getTitles()) {
      output = `${output}\r\n${this.getTitle().toString(indent)}`
    }

    if (this.getChildAnswers().length) {
      output = `${output}\r\n${this.getChildAnswers()
        .map(answer => answer.toString(indent + 4))
        .join('\r\n')}`
    }
    return output
  }

  private uniqueOrThrow<T>(list: T[]): T {
    if (list.length === 1) {
      return list[0]
    }
    if (list.length !== 0) {
      throw new Error(`Duplicates found in question ${this.id()}`)
    }
    return null
  }
}
