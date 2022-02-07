import { getProcessedText, PlaceholderValues } from './Placeholder'

export default class Question {
  question: string

  constructor(question: string) {
    this.question = question
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return getProcessedText(this.question, placeholderValues)
  }
}
