import { PageElement } from '../pages/page'

// In order to bypass the date picker we force the input to accept text and then press escape so the date picker
// disappears allowing us to interact with other fields.
export const forceDateInput = (day: number, month: number, year: number, field: string): PageElement =>
  cy
    .get(field)
    .clear({ force: true })
    .type(`${`${day}`.padStart(2, '0').slice(-2)}/${`${month}`.padStart(2, '0').slice(-2)}/${year}{esc}`, {
      force: true,
    })

export const forceDateInputWithDate = (
  date: Date = new Date(),
  field = '[data-qa="incident-details-date"]'
): PageElement => {
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  return forceDateInput(day, month, year, field)
}
