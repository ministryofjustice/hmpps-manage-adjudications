module.exports = cy => {
  const datePicker = () => cy.get('[data-qa="incident-details-date"]')
  const getPickerYearSelector = year => cy.get(`.ui-datepicker-year:contains(${year})`)
  const getPickerMonthByIndexSelector = index => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return cy.get(`.ui-datepicker-month:contains(${months[index]})`)
  }
  const getPickerDaySelector = day => cy.get(`.ui-state-default`).then(date => date[day])

  const pickDate = (day, month, year) => {
    datePicker().click()
    getPickerYearSelector(year).click()
    getPickerMonthByIndexSelector(month).click()
    getPickerDaySelector(day).click()
  }

  return {
    pickDate,
  }
}
