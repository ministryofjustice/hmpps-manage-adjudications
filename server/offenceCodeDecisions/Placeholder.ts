export type PlaceholderValues = {
  offenderFirstName: string
  offenderLastName: string
}

export type Placeholder = '{OFFENDER_FIRST_NAME}' | '{OFFENDER_LAST_NAME}'

export default function getProcessedText(template: string, placeholderValues: PlaceholderValues): string {
  return (template || '')
    .replace('{OFFENDED_FIRST_NAME}', placeholderValues.offenderFirstName)
    .replace('{OFFENDER_LAST_NAME}', placeholderValues.offenderLastName)
}
