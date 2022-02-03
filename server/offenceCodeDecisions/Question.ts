export default class Question {
  question: string

  questionType: QuestionType

  constructor(question: string, questionType: QuestionType = 'RADIO') {
    this.question = question
  }
}

type QuestionType = 'RADIO' | 'FIND_PRISONER'
