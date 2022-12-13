export type Alert = {
  alertId: number
  bookingId: number
  offenderNo: string
  alertType: string
  alertTypeDescription: string
  alertCode: string
  alertCodeDescription: string
  comment: string
  dateCreated: string
  dateExpires: string
  expired: boolean
  active: boolean
  addedByFirstName: string
  addedByLastName: string
  expiredByFirstName: string
  expiredByLastName: string
}

export type PrisonerAlerts = {
  prisonerNumber: string
  alerts: Alert[]
}

export type AlertFlags = {
  alertCodes: string[]
  classes: string
  label: string
}

export const alertFlagLabels = [
  { alertCodes: ['HA'], classes: 'alert-status alert-status--acct', label: 'ACCT OPEN' },
  {
    alertCodes: ['PEEP'],
    classes: 'alert-status alert-status--disability',
    label: 'PEEP',
  },
  { alertCodes: ['CSIP'], classes: 'alert-status alert-status--csip', label: 'CSIP' },
  { alertCodes: ['PRGNT'], classes: 'alert-status alert-status--prgnt', label: 'PREGNANT' },
]
