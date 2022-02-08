import type { PlaceholderValues } from './Placeholder'
import { getProcessedText } from './Placeholder'
import IncidentRole from '../incidentRole/IncidentRole'

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
    return getProcessedText(this.titles.get(incidentRole), placeholderValues)
  }

  toString(indent = 0) {
    let output = ''
    const padding = new Array(indent).join(' ')
    const distinct = new Set(this.getTitles().values())
    if (distinct.size === 1) {
      output = `${output}\r\n${padding}Title: ${distinct.values().next().value}`
    } else {
      this.getTitles().forEach((title, incidentRole) => {
        output = `${output}\r\n${padding}Title(${incidentRole}): ${title}`
      })
    }
    return output
  }
}
