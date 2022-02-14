import Title from './Title'
import Question from './Question'
import IncidentRole from '../incidentRole/IncidentRole'

export class Decision {
  private parentDecision: Decision

  private childrenDecisions: Array<Decision> = new Array<Decision>()

  private readonly decisionQuestion: Question

  private decisionCode: string

  private decisionTitle: Title

  private decisionType: DecisionType = DecisionType.RADIO_SELECTION_ONLY

  private decisionUrl: string

  constructor(question?: Question | string) {
    if (question instanceof Question) {
      this.decisionQuestion = question
    } else if (typeof question === 'string') {
      this.decisionQuestion = new Question(question)
    }
  }

  id(): string {
    if (this.getParent()) {
      return `${this.getParent().id()}:${this.getParent().childrenDecisions.indexOf(this)}`
    }
    return '0'
  }

  parent(parent: Decision) {
    this.parentDecision = parent
  }

  child(child: Decision) {
    child.parent(this)
    this.childrenDecisions.push(child)
    return this
  }

  title(title: Title | string | (readonly (readonly [IncidentRole, string])[] | null)) {
    if (title instanceof Title) {
      this.decisionTitle = title
    } else if (typeof title === 'string') {
      this.decisionTitle = new Title(title)
    } else {
      this.decisionTitle = new Title(title)
    }
    return this
  }

  code(code: string | number) {
    this.decisionCode = `${code}`
    return this
  }

  url(url: string) {
    this.decisionUrl = url
    return this
  }

  type(decisionType: DecisionType) {
    this.decisionType = decisionType
    return this
  }

  getType() {
    return this.decisionType
  }

  getId() {
    return this.id()
  }

  getTitle() {
    return this.decisionTitle
  }

  getQuestion() {
    return this.decisionQuestion
  }

  getChildren() {
    return this.childrenDecisions
  }

  getParent() {
    return this.parentDecision
  }

  getUrl(): string {
    return this.decisionUrl || this.id()
  }

  getCode() {
    return this.decisionCode
  }

  allUrls(): Array<string> {
    const urls = [].concat(...this.getChildren().map(c => c.allUrls()))
    if (this.getUrl()) {
      urls.push(this.getUrl())
    }
    return urls.sort()
  }

  findByUrl(url: string): Decision {
    return this.findBy(d => d.getUrl() === url)
  }

  findById(id: string): Decision {
    return this.findBy(d => d.id() === id)
  }

  findBy(fn: (d: Decision) => boolean): Decision {
    const matching = this.matching(fn)
    if (matching.length !== 0) {
      return matching[0]
    }
    return null
  }

  matching(fn: (d: Decision) => boolean): Array<Decision> {
    const matches = [].concat(...this.getChildren().map(c => c.matching(fn)))
    if (fn(this)) {
      matches.push(this)
    }
    return matches
  }

  allCodes(): Array<string> {
    const codes = [].concat(...this.getChildren().map(c => c.allCodes()))
    if (this.getCode()) {
      codes.push(this.getCode())
    }
    return codes.sort()
  }

  questionsToGetHere(): Array<Question> {
    let questions = new Array<Question>()
    if (this.getParent()) {
      questions = this.getParent().questionsToGetHere()
    }
    if (this.getQuestion()) {
      questions.push(this.getQuestion())
    }
    return questions
  }

  findByCode(code: string): Decision {
    return this.findBy(d => d.getCode() === code)
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Id: ${this.id()}`
    if (this.getQuestion()?.question) {
      output = `${output}\r\n${padding}Question: ${this.getQuestion()?.question}`
    }
    if (this.getTitle()?.getTitles()) {
      output = `${output}\r\n${this.getTitle().toString(indent)}`
    }
    if (this.getCode()) {
      output = `${output}\r\n${padding}Code: ${this.getCode()}`
    }
    if (this.getChildren().length) {
      output = `${output}\r\n${this.getChildren()
        .map(child => child.toString(indent + 4))
        .join('\r\n')}`
    }
    return output
  }
}

export function decision(question: Question | string) {
  return new Decision(question)
}

// eslint-disable-next-line no-shadow
export enum DecisionType {
  RADIO_SELECTION_ONLY = 'RADIO_SELECTION_ONLY',
  PRISONER = 'PRISONER',
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  ANOTHER = 'ANOTHER',
}
