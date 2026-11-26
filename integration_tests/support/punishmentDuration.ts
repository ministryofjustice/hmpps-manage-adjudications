import Page from '../pages/page'
import PunishmentDurationPage from '../pages/punishmentDuration'
import PunishmentSchedulePage from '../pages/punishmentSchedule'

export type StartMode = 'IMMEDIATE' | 'LATER' | 'SUSPENDED'

// Answers "Duration and start date" for a single day-based punishment. The date is dd/mm/yyyy and is the start
// date for LATER or the date suspended until for SUSPENDED.
export const answerDuration = (days: string, startMode: StartMode, date?: string) => {
  const durationPage = Page.verifyOnPage(PunishmentDurationPage)
  durationPage.days().clear().type(days)
  durationPage.startMode().find(`input[value="${startMode}"]`).check()
  if (startMode === 'LATER') durationPage.startDate().clear().type(date)
  if (startMode === 'SUSPENDED') durationPage.suspendedUntil().clear().type(date)
  durationPage.submitButton().click()
}

// Answers the duration page, then confirms the punishment schedule, which returns to the award punishments page
export const addDuration = (days: string, startMode: StartMode, date?: string) => {
  answerDuration(days, startMode, date)
  Page.verifyOnPage(PunishmentSchedulePage).submitButton().click()
}
