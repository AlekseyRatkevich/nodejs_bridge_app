import { setUsernameLocal } from "../script.js"
const usernamePopUp = document.querySelector('.main__username_popup')
const usernameOverlay = document.getElementById('usernameOverlay')

export function openUsernamePopUp() {
  usernamePopUp.style.visibility = 'visible'
  usernamePopUp.style.opacity = '1'
  usernameOverlay.style.visibility = 'visible'
  usernameOverlay.style.opacity = '1'
}

export function closeusernamePopUp() {
  usernamePopUp.style.visibility = 'hidden'
  usernamePopUp.style.opacity = '0'
  usernameOverlay.style.visibility = 'hidden'
  usernameOverlay.style.opacity = '0'
}

export function getUsernameOnEnter() {
  let text = $('#usernameInput')
  $('#usernameInput').on('keypress', function (e) {
    if (e.which == 13 && text.val().length !== 0 && text.val() !== ' ') {
      getUsername()
    }
  })
}

export function getUsername() {
  const username = document.getElementById('usernameInput').value
  if (
    username == null ||
    username === undefined ||
    username == '' ||
    username == ' '
  ) {
    alert('Please, write something')
  } else {
    closeusernamePopUp()
  }
  setUsernameLocal(username)
}

