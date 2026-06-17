document.addEventListener('DOMContentLoaded', () => {
  function searchSubmit(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      document.querySelectorAll('.assistedSearchSubmit').forEach(element => element.click())
    }
  }

  document.getElementById('assistedInput')?.addEventListener('keypress', searchSubmit)
  document.getElementById('currentRadioSelected-4')?.addEventListener('keypress', searchSubmit)
})
