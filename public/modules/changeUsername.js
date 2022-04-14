export function changeUsername() {
  let text = $('#change_usernameInput')
  $('#change_usernameInput').on('keypress', function (e) {
    if (e.which == 13 && text.val().length !== 0 && text.val() !== ' ') {
      localStorage.setItem('username', text.val())
      document.location.reload()
    }
  })
}