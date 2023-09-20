import Title from './Title'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import Question from './Question'
// eslint-disable-next-line import/no-cycle
import { Answer } from './Answer'

export function question(
  title: Title | string | (readonly (readonly [IncidentRole, string])[] | null),
  firstOffenceListQuestion = false
) {
  return new Question(title, firstOffenceListQuestion)
}

export function answer(text: string | [string, string]) {
  return new Answer(text)
}

export const notEmpty = (it: unknown) => it !== undefined

export const all = () => true
