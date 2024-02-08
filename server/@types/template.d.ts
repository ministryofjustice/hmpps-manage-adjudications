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
  activeCaseLoad?: ActiveCaseLoad
}

export type ActiveCaseLoad = {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export type AvailableComponent = 'header' | 'footer' | 'meta'

export type EstablishmentInformation = { agency: string; agencyDescription: string }
