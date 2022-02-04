import Title from './Title'
import Question from './Question'
import Code from './Code'

export default class Decision {
  private parentDecision: Decision

  private childrenDecisions: Array<Decision> = new Array<Decision>()

  private readonly decisionQuestion: Question

  private decisionCode: Code

  private decisionTitle: Title

  private decisionPage: Page

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

  page(page: Page) {
    this.decisionPage = page
    return this
  }

  title(title: Title | string) {
    if (title instanceof Title) {
      this.decisionTitle = title
    } else if (typeof title === 'string') {
      this.decisionTitle = new Title(title)
    }
    return this
  }

  code(code: Code) {
    this.decisionCode = code
    return this
  }

  url(url: string) {
    this.decisionUrl = url
    return this
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

  getPage(): string {
    return this.decisionPage
  }

  getCode() {
    return this.decisionCode
  }

  allUrls(): Array<string> {
    const codes = [].concat(...this.getChildren().map(c => c.allUrls()))
    if (this.getUrl()) {
      codes.push(this.getUrl())
    }
    return codes.sort()
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

  allCodes(): Array<Code> {
    const codes = [].concat(...this.getChildren().map(c => c.allCodes()))
    if (this.getCode()) {
      codes.push(this.getCode())
    }
    return codes.sort()
  }

  invalidDecisions(): Array<Decision> {
    return this.matching(d => d.invalid())
  }

  invalid(): boolean {
    return (
      (this.getChildren().length === 0 && this.getCode() == null) ||
      (this.getChildren().length !== 0 && this.getTitle() == null) ||
      (this.getUrl() != null && this.matching(d => d !== this && d.getUrl() === this.getUrl()).length !== 0) ||
      (this.getUrl() != null && this.getUrl().startsWith('/')) ||
      (this.getPage() != null && this.getPage().startsWith('/'))
    )
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

  findByCode(code: Code): Decision {
    return this.findBy(d => d.getCode()?.code === code?.code)
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Id: ${this.id()}`
    if (this.getQuestion()?.question) {
      output = `${output}\r\n${padding}Question: ${this.getQuestion()?.question}`
    }
    if (this.getTitle()?.title) {
      output = `${output}\r\n${padding}Title: ${this.getTitle().title}`
    }
    if (this.getChildren().length) {
      output = `${output}\r\n${this.getChildren()
        .map(child => child.toString(indent + 4))
        .join('\r\n')}`
    }
    if (this.getCode()?.code) {
      output = `${output}\r\n${padding}Code: ${this.getCode().code}`
    }
    return output
  }
}

type Page = 'Default'
