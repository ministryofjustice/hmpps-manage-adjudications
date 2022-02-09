export class Code {
  uniqueId: number

  constructor(uniqueId: number) {
    this.uniqueId = uniqueId
  }

  getId() {
    return this.uniqueId
  }

  toString(indent = 0) {
    const padding = new Array(indent).join(' ')
    return `${padding}Code: ${this.getId()}`
  }
}

export function id(code: number) {
  return new Code(code)
}
