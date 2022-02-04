import processText, { PlaceholderValues } from './Placeholder'

type QuestionType = 'RADIO' | 'FIND_PRISONER'

export default class Question {
  question: string

  questionType: QuestionType

  constructor(question: string, questionType: QuestionType = 'RADIO') {
    this.question = question
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return processText(this.question, placeholderValues)
  }
}
