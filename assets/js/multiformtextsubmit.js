jQuery(function () {
  function searchSubmit(event) {
    if (event.which == 13) {
      event.preventDefault()
      $('.assistedSearchSubmit').trigger('click')
    }
  }
  $('#assistedInput').on('keypress', function (event) {
    searchSubmit(event)
  })
  $('#currentRadioSelected-4').on('keypress', function (event) {
    searchSubmit(event)
  })
})
