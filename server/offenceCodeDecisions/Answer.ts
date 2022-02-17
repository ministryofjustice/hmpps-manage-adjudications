import { getProcessedText, PlaceholderValues } from './Placeholder'

export default class Answer {
  text: string

  constructor(text: string) {
    this.text = text
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.text, placeholderValues)
  }
}
