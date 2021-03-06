export interface FormError {
  href: string
  text: string
}

type SubmittedTime = {
  hour?: string
  minute?: string
}

export type SubmittedDateTime = {
  date?: string
  time?: SubmittedTime
}
