import processText, { PlaceholderValues } from './Placeholder'

export default class Question {
  question: string

  constructor(question: string) {
    this.question = question
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return processText(this.question, placeholderValues)
  }
}
