import Title from './Title'
// eslint-disable-next-line import/no-cycle
import { Answer } from './Answer'
import { IncidentRole } from '../incidentRole/IncidentRole'

export default class Question {
  private parentAnswer: Answer

  private childAnswers: Answer[] = []

  private readonly questionTitle: Title

  private questionUrl: string

  constructor(title: Title | string | (readonly (readonly [IncidentRole, string])[] | null)) {
    if (title instanceof Title) {
      this.questionTitle = title
    } else if (typeof title === 'string') {
      this.questionTitle = new Title(title)
    } else {
      this.questionTitle = new Title(title)
    }
  }

  id(): string {
    if (this.getParentAnswer()) {
      return this.getParentAnswer().id()
    }
    return '1'
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

  url(url: string) {
    this.questionUrl = url
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

  getUrl(): string {
    return this.questionUrl || this.id()
  }

  allUrls(): string[] {
    return this.matchingQuestions(() => true)
      .map(question => question.getUrl())
      .sort()
  }

  findQuestionByUrl(url: string): Question {
    return this.findQuestionBy(question => question.getUrl() === url)
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
    return this.getChildAnswers() ? [].concat(...this.getChildAnswers().map(a => a.matchingAnswers(fn))) : []
  }

  allCodes(): Array<number> {
    return [].concat(...this.getChildAnswers().map(answer => answer.allCodes()))
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
