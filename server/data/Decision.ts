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

  constructor(question?: Question) {
    this.decisionQuestion = question
  }

  page(page: Page) {
    this.decisionPage = page
    return this
  }

  child(child: Decision) {
    child.parent(this)
    this.childrenDecisions.push(child)
    return this
  }

  title(title: Title) {
    this.decisionTitle = title
    return this
  }

  code(code: Code) {
    this.decisionCode = code
    return this
  }

  parent(parent: Decision) {
    this.parentDecision = parent
  }

  id(): string {
    if (this.parentDecision) {
      return `${this.parentDecision.id()}:${this.parentDecision.childrenDecisions.indexOf(this)}`
    }
    return '0'
  }

  findById(id: string): Decision {
    if (id === this.id()) {
      return this
    }
    const matches = this.childrenDecisions.map(c => c.findById(id)).filter(c => c)
    if (matches.length) {
      return matches[0]
    }
    return null
  }

  questionsTo(): Array<Question> {
    let questions = new Array<Question>()
    if (this.parentDecision) {
      questions = this.parentDecision.questionsTo()
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
    const matches: Array<Decision> = [].concat(...this.childrenDecisions.map(c => c.findByTitle(title)))
    if (title?.title === this.decisionTitle?.title) {
      matches.push(this)
    }
    return matches
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
