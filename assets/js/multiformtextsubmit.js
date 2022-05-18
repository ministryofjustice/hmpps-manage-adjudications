jQuery(function () {
  $('#assistedInput').on('keypress', function (event) {
    if (event.which == 13) {
      alert('Submitting!')
      event.preventDefault()
      $('.assistedSearchSubmit').trigger('click')
    }
  })
})
