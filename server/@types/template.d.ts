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

export default interface FrontendComponent {
  html: string
  css: string[]
  javascript: string[]
}

export type AvailableComponent = 'header' | 'footer'

export type EstablishmentInformation = { agency: string; agencyDescription: string }
