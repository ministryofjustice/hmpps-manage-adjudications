import processText from './Placeholder'
import type { PlaceholderValues } from './Placeholder'

export default class Title {
  title: string

  constructor(title: string) {
    this.title = title
  }

  getProcessedText(placeholderValues: PlaceholderValues): string {
    return processText(this.title, placeholderValues)
  }
}
