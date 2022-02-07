export type PlaceholderValues = {
  offenderFirstName: string
  offenderLastName: string
}

// eslint-disable-next-line no-shadow
export const enum PlaceholderText {
  OFFENDER_FIRST_NAME = '{OFFENDER_FIRST_NAME}',
  OFFENDER_LAST_NAME = '{OFFENDER_LAST_NAME}',
}

export function getProcessedText(template: string, placeholderValues: PlaceholderValues): string {
  return (template || '')
    .replace(PlaceholderText.OFFENDER_FIRST_NAME, placeholderValues.offenderFirstName)
    .replace(PlaceholderText.OFFENDER_LAST_NAME, placeholderValues.offenderLastName)
}
