import Title from './Title'
import Question from './Question'
import Code from './Code'

export default class Decision {
  parent: Decision

  children: Array<Decision> = new Array<Decision>()

  question: Question

  code: Code

  title: Title

  page: Page = 'Default'

  constructor(question?: Question) {
    this.question = question
  }

  withPage(page: Page) {
    this.page = page
    return this
  }

  withChild(child: Decision) {
    child.setParent(this)
    this.children.push(child)
    return this
  }

  withTitle(title: Title) {
    this.title = title
    return this
  }

  withCode(code: Code) {
    this.code = code
    return this
  }

  setParent(parent: Decision) {
    this.parent = parent
  }

  id(): string {
    if (this.parent) {
      return `${this.parent.id()}:${this.parent.children.indexOf(this)}`
    }
    return '0'
  }

  findById(id: string): Decision {
    if (id === this.id()) {
      return this
    }
    const matches = this.children.map(c => c.findById(id)).filter(c => c)
    if (matches.length) {
      return matches[0]
    }
    return null
  }

  questionsTo(): Array<Question> {
    let questions = new Array<Question>()
    if (this.parent) {
      questions = this.parent.questionsTo()
    }
    if (this.question) {
      questions.push(this.question)
    }
    return questions
  }

  findByCode(code: Code): Decision {
    if (code?.code === this.code?.code) {
      return this
    }
    const matches = this.children.map(c => c.findByCode(code)).filter(c => c)
    if (matches.length) {
      return matches[0]
    }
    return null
  }

  findByTitle(title: Title): Array<Decision> {
    const matches: Array<Decision> = [].concat(...this.children.map(c => c.findByTitle(title)))
    if (title?.title === this.title?.title) {
      matches.push(this)
    }
    return matches
  }

  toString(indent = 0): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Id: ${this.id()}`
    if (this.question?.question) {
      output = `${output}\r\n${padding}Question: ${this.question?.question}`
    }
    if (this.title?.title) {
      output = `${output}\r\n${padding}Title: ${this.title.title}`
    }
    if (this.children.length) {
      output = `${output}\r\n${this.children.map(child => child.toString(indent + 4)).join('\r\n')}`
    }
    if (this.code?.code) {
      output = `${output}\r\n${padding}Code: ${this.code.code}`
    }
    return output
  }
}

type Page = 'Default'
