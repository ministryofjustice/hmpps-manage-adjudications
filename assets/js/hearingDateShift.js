jQuery(function () {
  function changeDateAndSubmit(event, arrowChosen) {
    // get currently selected date from the datepicker
    var date = $('#hearingDate').datepicker('getDate')
    // increase or decrease the day depending on the arrow clicked
    if (arrowChosen == 'inc') {
      date.setDate(date.getDate() + 1)
    }
    if (arrowChosen == 'dec') {
      date.setDate(date.getDate() - 1)
    }
    // set the new date in the datepicker
    $('#hearingDate').datepicker('setDate', date)
  }

  $('#hearing-arrow-right').on('click', function (event) {
    changeDateAndSubmit(event, 'inc')
  })
  $('#hearing-arrow-left').on('click', function (event) {
    changeDateAndSubmit(event, 'dec')
  })
})
