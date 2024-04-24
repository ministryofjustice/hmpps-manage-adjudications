import Title from './Title'
// eslint-disable-next-line import/no-cycle
import { Answer, AnswerType } from './Answer'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import { all, notEmpty } from './Decisions'
import config from '../config'
import {
  ProtectedCharacteristicsTypes,
  getProtectedCharacteristicsTitle,
} from '../routes/offenceCodeDecisions/offenceData'

export default class Question {
  private parentAnswer: Answer[] = []

  private childAnswers: Answer[] = []

  private readonly questionTitle: Title

  private readonly overrideId?: string

  private readonly applicableVersions: number[]

  constructor(
    title: Title | string | (readonly (readonly [IncidentRole, string])[] | null),
    overrideId?: string | null,
    applicableVersions: number[] = [1, 2]
  ) {
    this.overrideId = overrideId
    this.applicableVersions = applicableVersions
    if (title instanceof Title) {
      this.questionTitle = title
    } else if (typeof title === 'string') {
      this.questionTitle = new Title(title)
    } else {
      this.questionTitle = new Title(title)
    }
  }

  // The id is 1 when this is the top most question otherwise it is that of the parent answer.
  id(): string {
    return this.getParentAnswer()?.id() || this.overrideId || '1'
  }

  isApplicableVersion(version: number): boolean {
    return this.applicableVersions.includes(version)
  }

  parent(parent: Answer) {
    this.parentAnswer.push(parent)
    return this
  }

  child(child: Answer) {
    child.parent(this)
    this.childAnswers.push(child)
    return this
  }

  versionedChild(child: Answer[]) {
    child.forEach(c => {
      this.childAnswers.push(c)
      c.parent(this)
    })

    return this
  }

  getTitle() {
    return this.questionTitle
  }

  getChildAnswers(overrideVersion: number = null) {
    return this.childAnswers.filter(a => a.isApplicableVersion(overrideVersion || +config.offenceVersion))
  }

  getParentAnswer() {
    return this.parentAnswer.find(a => a.isApplicableVersion(+config.offenceVersion))
  }

  allIds(): string[] {
    return this.matchingQuestions(all)
      .map(question => question.id())
      .sort()
  }

  findQuestionById(id: string): Question {
    return this.findQuestionBy(question => question.id() === id)
  }

  allCodes(): Array<number> {
    return this.matchingAnswers(answer => !!answer.getOffenceCode()).map(answer => answer.getOffenceCode())
  }

  findAnswerByCode(offenceCode: number, firstProtectedCharacteristic: string = null): Answer {
    const answer = this.findAnswerBy(a => a.getOffenceCode() === offenceCode, null, firstProtectedCharacteristic)
    return answer || this.findAnswerByCodeForPreviousVersions(offenceCode)
  }

  private findAnswerByCodeForPreviousVersions(
    offenceCode: number,
    firstProtectedCharacteristic: string = null
  ): Answer {
    /* eslint-disable no-plusplus */
    for (let version = +config.offenceVersion - 1; version > 0; version--) {
      const answer = this.findAnswerBy(a => a.getOffenceCode() === offenceCode, version, firstProtectedCharacteristic)
      if (answer !== null) {
        return answer
      }
    }

    throw new Error(`unable to find answer for ${offenceCode}`)
  }

  findAnswerById(id: string): Answer {
    return this.findAnswerBy(answer => answer.id() === id)
  }

  toString(indent = 0, version = 1): string {
    const padding = new Array(indent).join(' ')
    let output = `${padding}Question Id: ${this.id()}`
    if (this.getTitle()?.getTitles()) {
      output = `${output}\r\n${this.getTitle().toString(indent)}`
    }

    if (this.getChildAnswers().length) {
      output = `${output}\r\n${this.getChildAnswers()
        .map(answer => answer.toString(indent + 4, version))
        .join('\r\n')}`
    }

    return output
  }

  // note the below functions are only public for testing
  findQuestionBy(fn: (question: Question) => boolean): Question {
    const matching = this.matchingQuestions(fn)
    return this.uniqueOrThrow(matching)
  }

  matchingQuestions(fn: (question: Question) => boolean): Question[] {
    const matches = [].concat(
      ...this.getChildAnswers()
        .map(childAnswer => childAnswer.getChildQuestion())
        .filter(childQuestion => !!childQuestion)
        .map(d => d.matchingQuestions(fn))
    )
    if (fn(this)) {
      matches.push(this)
    }
    return matches
  }

  findAnswerBy(
    fn: (answer: Answer) => boolean,
    overrideVersion: number = null,
    firstProtectedCharacteristic: string = null
  ): Answer {
    const matching = this.matchingAnswers(fn, overrideVersion)
    if (
      firstProtectedCharacteristic &&
      matching.length !== 0 &&
      matching.every(answer => answer.getType() === AnswerType.CHECKBOXES_ONLY)
    ) {
      const titleToMatch = getProtectedCharacteristicsTitle(ProtectedCharacteristicsTypes[firstProtectedCharacteristic])
      return matching.find(a => a.getText() === titleToMatch)
    }
    return this.uniqueOrThrow(matching)
  }

  matchingAnswers(fn: (answer: Answer) => boolean, overrideVersion: number = null): Answer[] {
    return []
      .concat(...this.getChildAnswers(overrideVersion).map(a => a.matchingAnswers(fn, overrideVersion)))
      .filter(notEmpty)
  }

  private uniqueOrThrow<T>(list: T[]): T {
    if (list.length === 1) {
      return list[0]
    }
    if (list.length !== 0) {
      throw new Error(`Duplicates found in question ${this.id()}`)
    }
    return null
  }
}
