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
    const urls = [].concat(
      ...this.getChildAnswers()
        .map(a => a.getChildQuestion())
        .filter(d => !!d)
        .map(d => d.allUrls())
    )
    if (this.getUrl()) {
      urls.push(this.getUrl())
    }
    return urls.sort()
  }

  findDecisionByUrl(url: string): Question {
    return this.findDecisionBy(d => d.getUrl() === url)
  }

  findDecisionById(id: string): Question {
    return this.findDecisionBy(d => d.id() === id)
  }

  findDecisionBy(fn: (d: Question) => boolean): Question {
    const matching = this.matchingDecisions(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingDecisions(fn: (d: Question) => boolean): Question[] {
    const matches = [].concat(
      ...this.getChildAnswers()
        .map(a => a.getChildQuestion())
        .filter(d => !!d)
        .map(d => d.matchingDecisions(fn))
    )
    if (fn(this)) {
      matches.push(this)
    }
    return matches
  }

  findAnswerBy(fn: (a: Answer) => boolean): Answer {
    const matching = this.getChildAnswers()
      .map(childAnswer => childAnswer.findAnswerBy(fn))
      .filter(a => !!a)
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (d: Answer) => boolean): Answer[] {
    if (this.getChildAnswers()) {
      return [].concat(...this.getChildAnswers().map(a => a.matchingAnswers(fn)))
    }
    return []
  }

  allCodes(): Array<number> {
    return [].concat(...this.getChildAnswers().map(a => a.allCodes()))
  }

  findAnswerByCode(offenceCode: number): Answer {
    return this.findAnswerBy(a => a.getOffenceCode() === offenceCode)
  }

  findAnswerById(id: string): Answer {
    return this.findAnswerBy(a => a.id() === id)
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Decision Id: ${this.id()}`
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
      throw new Error(`Duplicates found in decision ${this.id()}`)
    }
    return null
  }
}
