export default class DropDownEntry {
  text: string

  label: string

  value: string

  constructor(text: string, label: string, value: string) {
    this.text = text // This is used to display chart data so retained
    this.label = label
    this.value = value
  }

  public static getByValueOrElse(
    values: DropDownEntry[],
    value: string,
    defaultValue: DropDownEntry
  ): DropDownEntry | undefined {
    if (value === undefined) {
      return defaultValue
    }
    for (let i = 0; i < values.length; i += 1) {
      const item: DropDownEntry = values[i]
      if (item.value === value) {
        return item
      }
    }
    return defaultValue
  }
}
