import { getProcessedText, PlaceholderValues } from './Placeholder'
// eslint-disable-next-line import/no-cycle
import Question from './Question'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import { notEmpty } from './Decisions'
import config from '../config'
import {
  getProtectedCharacteristicsTitle,
  ProtectedCharacteristicsTypes,
} from '../routes/offenceCodeDecisions/offenceData'

export class Answer {
  private readonly answerText: string

  private readonly answerReplayText: string

  private readonly applicableVersions: number[]

  private answerOffenceCode: number

  private childQuestion: Question[] = []

  private parentQuestion: Question

  private answerType: AnswerType = AnswerType.RADIO_SELECTION_ONLY

  constructor(text: string | [string, string], applicableVersions: number[]) {
    this.applicableVersions = applicableVersions
    if (typeof text === 'string') {
      this.answerText = text
    } else if (text instanceof Array) {
      ;[this.answerText, this.answerReplayText] = text
    }
  }

  // The id is that of the parent question with the answer index appended. There should always be a parent question but
  // if not we assume its id would be 1. Note indexes are 1 based.
  id() {
    const parentId = this.getParentQuestion()?.id() || 1
    const index = (this.getParentQuestion()?.getChildAnswers().indexOf(this) || 0) + 1
    return `${parentId}-${index}`
  }

  isApplicableVersion(version: number): boolean {
    return this.applicableVersions.includes(version)
  }

  child(child: Question): Answer {
    this.childQuestion = [child]
    child.parent(this)
    return this
  }

  versionedChild(child: Question[]): Answer {
    this.childQuestion = child
    child.forEach(c => c.parent(this))
    return this
  }

  parent(parent: Question): Answer {
    this.parentQuestion = parent
    return this
  }

  type(answerType: AnswerType): Answer {
    this.answerType = answerType
    return this
  }

  offenceCode(offenceCode: number): Answer {
    this.answerOffenceCode = offenceCode
    return this
  }

  getType(): AnswerType {
    return this.answerType
  }

  getText(): string {
    return this.answerText
  }

  getOffenceCode(): number {
    return this.answerOffenceCode
  }

  getProcessedText(placeholderValues: PlaceholderValues, prisonerView: boolean): string {
    return getProcessedText(this.answerText, placeholderValues, prisonerView)
  }

  getProcessedReplayText(placeholderValues: PlaceholderValues, prisonerView: boolean): string {
    return getProcessedText(this.answerReplayText || this.answerText, placeholderValues, prisonerView)
  }

  getParentQuestion(): Question {
    return this.parentQuestion
  }

  getChildQuestion(overrideVersion: number = null): Question {
    return this.childQuestion.find(c => c.isApplicableVersion(overrideVersion || +config.offenceVersion))
  }

  getChildAnswers(overrideVersion: number = null): Answer[] {
    return this.getChildQuestion(overrideVersion)?.getChildAnswers(overrideVersion) || []
  }

  getQuestionsAndAnswersToGetHere(): { question: Question; answer: Answer }[] {
    let questionsAndAnswers = [] as { question: Question; answer: Answer }[]
    if (this.getParentQuestion().getParentAnswer()) {
      questionsAndAnswers = questionsAndAnswers.concat(
        this.getParentQuestion().getParentAnswer().getQuestionsAndAnswersToGetHere()
      )
    }
    questionsAndAnswers.push({ question: this.getParentQuestion(), answer: this })
    return questionsAndAnswers
  }

  getProcessedQuestionsAndAnswersToGetHere(
    placeHolderValues: PlaceholderValues,
    incidentRole: IncidentRole,
    prisonerView: boolean,
    protectedCharacteristics: string[]
  ): { question: string; answer: string }[] {
    const questionsAndAnswers = this.getQuestionsAndAnswersToGetHere().map(questionAndAnswer => {
      return {
        question: questionAndAnswer.question.getTitle().getProcessedText(placeHolderValues, incidentRole),
        answer: questionAndAnswer.answer.getProcessedReplayText(placeHolderValues, prisonerView),
      }
    })
    if (protectedCharacteristics) {
      protectedCharacteristics.forEach(pc => {
        const pcEnum = ProtectedCharacteristicsTypes[pc as keyof typeof ProtectedCharacteristicsTypes]
        const pcTitle = getProtectedCharacteristicsTitle(pcEnum)
        if (!questionsAndAnswers[questionsAndAnswers.length - 1].answer.includes(pcTitle)) {
          questionsAndAnswers[questionsAndAnswers.length - 1].answer = questionsAndAnswers[
            questionsAndAnswers.length - 1
          ].answer.concat(`, ${pcTitle}`)
        }
      })
    }

    return questionsAndAnswers
  }

  findAnswerBy(fn: (answer: Answer) => boolean): Answer {
    const matching = this.matchingAnswers(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (answer: Answer) => boolean, overrideVersion: number = null): Answer[] {
    const childMatches = []
      .concat(
        ...this.getChildAnswers(overrideVersion).map(childAnswer => childAnswer.matchingAnswers(fn, overrideVersion))
      )
      .filter(notEmpty)
    if (fn(this)) {
      childMatches.push(this)
    }
    return childMatches
  }

  toString(indent = 0, version = 1): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Answer Id: ${this.id()}`
    if (this.getText()) {
      output = `${output}\r\n${padding}Answer: ${this.getText()}`
    }
    if (this.getOffenceCode()) {
      output = `${output}\r\n${padding}Offence Code: ${this.getOffenceCode()}`
    }
    if (this.getChildQuestion()) {
      output = `${output}\r\n${this.getChildQuestion().toString(indent + 4, version)}`
    }
    return output
  }

  private uniqueOrThrow<T>(list: T[]): T {
    if (list.length === 1) {
      return list[0]
    }
    if (list.length !== 0) {
      throw new Error(`Duplicates found in answer ${this.id()}`)
    }
    return null
  }
}

// eslint-disable-next-line no-shadow
export enum AnswerType {
  RADIO_SELECTION_ONLY = 'RADIO_SELECTION_ONLY',
  PRISONER = 'PRISONER',
  PRISONER_OUTSIDE_ESTABLISHMENT = 'PRISONER_OUTSIDE_ESTABLISHMENT',
  OFFICER = 'OFFICER',
  STAFF = 'STAFF',
  OTHER_PERSON = 'OTHER_PERSON',
  CHECKBOXES_ONLY = 'CHECKBOXES_ONLY',
}
