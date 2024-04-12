import Title from './Title'
import { IncidentRole } from '../incidentRole/IncidentRole'
// eslint-disable-next-line import/no-cycle
import Question from './Question'
// eslint-disable-next-line import/no-cycle
import { Answer } from './Answer'

export function question(
  title: Title | string | (readonly (readonly [IncidentRole, string])[] | null),
  overrideId?: string | null
) {
  return new Question(title, overrideId)
}

export function answer(text: string | [string, string], applicableVersions: number[] = [1, 2]) {
  return new Answer(text, applicableVersions)
}

export const notEmpty = (it: unknown) => it !== undefined

export const all = () => true
