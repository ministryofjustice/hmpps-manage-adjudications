import { getProcessedText, PlaceholderValues } from './Placeholder'

export class Answer {
  private readonly answerText: string

  private readonly answerReplayText: string

  constructor(text: string | [string, string]) {
    if (typeof text === 'string') {
      this.answerText = text
    } else if (text instanceof Array) {
      ;[this.answerText, this.answerReplayText] = text
    }
  }

  getText() {
    return this.answerText
  }

  getReplayText() {
    return this.answerText
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerText, placeholderValues)
  }

  getProcessedReplayText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.answerReplayText || this.answerText, placeholderValues)
  }
}

export function answer(text: string) {
  return new Answer(text)
}
