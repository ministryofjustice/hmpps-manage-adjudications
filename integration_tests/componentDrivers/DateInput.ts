import { PageElement } from '../pages/page'

// In order to bypass the date picker we force the input to accept text and then press escape so the date picker
// disappears allowing us to interact with other fields.
const forceDateInput = (
  day: number,
  month: number,
  year: number,
  field = '[data-qa="incident-details-date"]'
): PageElement =>
  cy
    .get(field)
    .clear({ force: true })
    .type(`${`${day}`.padStart(2, '0').slice(-2)}/${`${month}`.padStart(2, '0').slice(-2)}/${year}{esc}`, {
      force: true,
    })

export default forceDateInput
