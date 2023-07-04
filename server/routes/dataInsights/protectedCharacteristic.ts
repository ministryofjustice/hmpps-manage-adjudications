export default class ProtectedCharacteristic {
  value: string

  text: string

  private static values: Map<string, ProtectedCharacteristic> = new Map<string, ProtectedCharacteristic>()

  constructor(value: string, text: string) {
    this.value = value
    this.text = text
    ProtectedCharacteristic.values.set(this.value, this)
  }

  public static DISABILITY = new ProtectedCharacteristic('disability', 'Disability')

  public static ETHNIC_GROUP = new ProtectedCharacteristic('ethnic_group', 'Ethnic group')

  public static RELIGION_GROUP = new ProtectedCharacteristic('religion_group', 'Religion group')

  public static SEX_ORIENTATION = new ProtectedCharacteristic('sex_orientation', 'Sex orientation')

  public static getProtectedCharacteristicsAndVulnerabilitiesValues(): ProtectedCharacteristic[] {
    return [this.DISABILITY, this.ETHNIC_GROUP, this.RELIGION_GROUP, this.SEX_ORIENTATION]
  }

  public static valueOfOrElse(
    value: string,
    defaultValue: ProtectedCharacteristic
  ): ProtectedCharacteristic | undefined {
    return (value !== undefined && this.values.get(value)) || defaultValue
  }
}
