import Title from './Title'
import Question from './Question'
import Code from './Code'

export default class Decision {
  private parentDecision: Decision

  private childrenDecisions: Array<Decision> = new Array<Decision>()

  private readonly decisionQuestion: Question

  private decisionCode: Code

  private decisionTitle: Title

  private decisionPage: Page = 'Default'

  private decisionUrl: string

  constructor(question?: Question | string) {
    if (question instanceof Question) {
      this.decisionQuestion = question
    } else if (typeof question === 'string') {
      this.decisionQuestion = new Question(question)
    }
  }

  id(): string {
    if (this.parentDecision) {
      return `${this.parentDecision.id()}:${this.parentDecision.childrenDecisions.indexOf(this)}`
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

  getTitle() {
    return this.decisionTitle
  }

  getQuestion() {
    return this.decisionQuestion
  }

  getChildren(): Array<Decision> {
    return this.childrenDecisions
  }

  getUrl(): string {
    return this.decisionUrl
  }

  allUrls(): Array<string> {
    const codes = [].concat(...this.childrenDecisions.map(c => c.allUrls()))
    if (this.decisionUrl) {
      codes.push(this.decisionUrl)
    }
    return codes.sort()
  }

  findByUrl(url: string): Decision {
    return this.findBy(d => d.decisionUrl === url)
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
    const matches = [].concat(...this.childrenDecisions.map(c => c.matching(fn)))
    if (fn(this)) {
      matches.push(this)
    }
    return matches
  }

  allCodes(): Array<Code> {
    const codes = [].concat(...this.childrenDecisions.map(c => c.allCodes()))
    if (this.decisionCode) {
      codes.push(this.decisionCode)
    }
    return codes.sort()
  }

  invalidDecisions(): Array<Decision> {
    return this.matching(d => d.invalid())
  }

  invalid(): boolean {
    return (
      (this.childrenDecisions.length === 0 && this.decisionCode == null) ||
      (this.childrenDecisions.length !== 0 && this.decisionTitle == null) ||
      (this.decisionUrl != null && this.matching(d => d !== this && d.decisionUrl === this.decisionUrl).length !== 0) ||
      (this.decisionUrl != null && this.decisionUrl.startsWith('/'))
    )
  }

  questionsToGetHere(): Array<Question> {
    let questions = new Array<Question>()
    if (this.parentDecision) {
      questions = this.parentDecision.questionsToGetHere()
    }
    if (this.decisionQuestion) {
      questions.push(this.decisionQuestion)
    }
    return questions
  }

  findByCode(code: Code): Decision {
    if (code?.code === this.decisionCode?.code) {
      return this
    }
    const matches = this.childrenDecisions.map(c => c.findByCode(code)).filter(c => c)
    if (matches.length) {
      return matches[0]
    }
    return null
  }

  findByTitle(title: Title): Array<Decision> {
    return this.matching(d => title?.title === this.decisionTitle?.title)
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Id: ${this.id()}`
    if (this.decisionQuestion?.question) {
      output = `${output}\r\n${padding}Question: ${this.decisionQuestion?.question}`
    }
    if (this.decisionTitle?.title) {
      output = `${output}\r\n${padding}Title: ${this.decisionTitle.title}`
    }
    if (this.childrenDecisions.length) {
      output = `${output}\r\n${this.childrenDecisions.map(child => child.toString(indent + 4)).join('\r\n')}`
    }
    if (this.decisionCode?.code) {
      output = `${output}\r\n${padding}Code: ${this.decisionCode.code}`
    }
    return output
  }
}

type Page = 'Default'
