export function copyToClipboard(text) {
  var inputc = document.body.appendChild(document.createElement('input'))
  inputc.value = window.location.href
  inputc.focus()
  inputc.select()
  document.execCommand('copy')
  inputc.parentNode.removeChild(inputc)
  $('.notify').toggleClass('active')
  $('#notifyType').toggleClass('success')
  setTimeout(function () {
    $('.notify').removeClass('active')
    $('#notifyType').removeClass('success')
  }, 1500)
}