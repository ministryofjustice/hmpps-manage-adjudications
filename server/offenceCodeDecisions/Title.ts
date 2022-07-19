import type { PlaceholderValues } from './Placeholder'
import { getProcessedText } from './Placeholder'
import { IncidentRole } from '../incidentRole/IncidentRole'

export default class Title {
  titles: Map<IncidentRole, string> = new Map<IncidentRole, string>()

  constructor(title: string | (readonly (readonly [IncidentRole, string])[] | null)) {
    if (typeof title === 'string') {
      Object.keys(IncidentRole).forEach(key => this.titles.set(IncidentRole[key], title))
    } else {
      this.titles = new Map<IncidentRole, string>(title)
    }
  }

  getTitles(): Map<IncidentRole, string> {
    return this.titles
  }

  getProcessedText(placeholderValues: PlaceholderValues, incidentRole: IncidentRole): string {
    return getProcessedText(this.titles.get(incidentRole), placeholderValues, false)
  }

  toString(indent = 0) {
    const padding = new Array(indent).join(' ')
    const distinct = new Set(this.getTitles().values())
    if (distinct.size === 1) {
      return `${padding}Title: ${distinct.values().next().value}`
    }
    return [...this.getTitles().entries()].map(entry => `${padding}Title(${entry[0]}): ${entry[1]}`).join('\r\n')
  }
}
