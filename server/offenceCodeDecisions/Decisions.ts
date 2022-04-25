import Title from './Title'
import { IncidentRole } from '../incidentRole/IncidentRole'
import Question from './Question'
import { Answer } from './Answer'

export function question(title: Title | string | (readonly (readonly [IncidentRole, string])[] | null)) {
  return new Question(title)
}

export function answer(text: string | [string, string]) {
  return new Answer(text)
}
