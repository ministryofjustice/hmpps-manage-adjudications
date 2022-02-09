export default class Code {
  code: string

  constructor(code: string) {
    this.code = code
  }

  getCode() {
    return this.code
  }

  toString(indent = 0) {
    const padding = new Array(indent).join(' ')
    return `${padding}Code: ${this.getCode()}`
  }
}
