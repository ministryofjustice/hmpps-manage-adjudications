export type PlaceholderValues = {
  offenderFirstName: string
  offenderLastName: string
  assistedFirstName: string
  assistedLastName: string
}

// eslint-disable-next-line no-shadow
export const enum PlaceholderText {
  OFFENDER_FULL_NAME = '{OFFENDER_FULL_NAME}',
  ASSISTED_FULL_NAME = '{ASSISTED_FULL_NAME}',
}

export function getProcessedText(template: string, placeholderValues: PlaceholderValues): string {
  return (template || '')
    .replace(
      PlaceholderText.OFFENDER_FULL_NAME,
      `${placeholderValues.offenderFirstName} ${placeholderValues.offenderLastName}`
    )
    .replace(
      PlaceholderText.ASSISTED_FULL_NAME,
      `${placeholderValues.assistedFirstName} ${placeholderValues.assistedLastName}`
    )
}
