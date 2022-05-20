$(function () {
  const $form = $('form')
  $form.on('submit', e => {
    e.preventDefault()
    const $radio = document.querySelector('[class="govuk-radios__item"] :checked')
    if ($radio) {
      const $radioChosen = $radio.value
      const eventCallback = function () {
        $form.trigger('submit')
      }
      if ($radioChosen === 'accepted') {
        gtag('event', 'REVIEWER ACCEPTED', {
          event_callback: eventCallback,
        })
      } else if ($radioChosen === 'returned') {
        gtag('event', 'REVIEWER RETURNED', {
          return_reason: document.querySelector('#returnedReasonId').value,
          return_details: document.querySelector('#returnedDetails').value,
          event_callback: eventCallback,
        })
      } else {
        gtag('event', 'REVIEWER REJECTED', {
          reject_reason: document.querySelector('#rejectedReasonId').value,
          reject_details: document.querySelector('#rejectedDetails').value,
          event_callback: eventCallback,
        })
      }
    }
  })
})
