import { arrLang } from "./modules/arrLang.js"
import { copyToClipboard } from "./modules/copyToClipboard.js"
import { createFullscreen } from "./modules/fullscreen.js"
import { muteUnmute, playStop } from "./modules/mediaControls.js"
import { openUsernamePopUp, closeusernamePopUp, getUsernameOnEnter, getUsername } from "./modules/usernamePopup.js"
import { openClosePopUp } from './modules/participants.js'
import { openPopUp, closePopUp } from "./modules/openCloseSettings.js"
import { checkPlaceholder, makeLangRU, makeLangEN, saveLocalLang } from "./modules/translate.js"
import { changeUsername } from "./modules/changeUsername.js"

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
})

// Modal window with username
window.addEventListener('load', function () {
  if (localStorage.getItem('username') === null) {
    openUsernamePopUp()
    getUsernameOnEnter()
  }
  setUsernameLocal(localStorage.getItem('username').toString())
})

const startBtn = document.querySelector('.main__username_popup_container_start-btn')
startBtn.addEventListener('click', getUsername)

export function setUsernameLocal(username) {
  localStorage.setItem('username', username)
  startApp()
}

export let myVideoStream
export function startApp() {
  const myVideo = document.createElement('video')
  myVideo.className = 'myvideo'
  myVideo.muted = true

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      myVideoStream = stream
      addVideoStream(myVideo, stream)
      myPeer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', (userVideoStream) => {
          addVideoStream(video, userVideoStream)
        })
      })
      const username = localStorage.getItem('username')
      // createFullscreen()
      // Is typing feature
      const chatInput = document.getElementById('chat_message')
      const feedback = document.getElementById('feedback')

      chatInput.addEventListener('keypress', (e) => {
        let containsRu = main.classList.contains('ru')
        if (e.which !== 13) {
          socket.emit('typing', username, containsRu)
        }
      })
      socket.on('typing', (username, containsRu) => {
        if (containsRu == true) {
          feedback.innerHTML = `<p class="feedback"><em>${username} is typing...</em></p>`
        } else {
          feedback.innerHTML = `<p class="feedback"><em>${username} печатает...</em></p>`
        }
        setTimeout(() => {
          feedback.innerHTML = ''
        }, 3000)
      })

      socket.emit('username', username)
      socket.on('username-back', (username, users) => {
        let containsRu = main.classList.contains('ru')
        if (containsRu == true) {
          $('.messages').append(
            `<li class="message info">Вы подключились к комнате</li>`
          )
        } else {
          $('.messages').append(
            `<li class="message info">You joined the room</li>`
          )
        }
        users.forEach((user) => {
          const name = user.username
          $('.main__participants_list').append(`<li>${name}</li>`)
        })
        scrollToBottom()
      })
      //User connected event
      socket.on('user-connected', (userId, username) => {
        connectToNewUser(userId, stream)
        let containsRu = main.classList.contains('ru')
        if (containsRu == true) {
          $('.messages').append(
            `<li class="message info"><user>${username}</user>Присоединился</li>`
          )
        } else {
          $('.messages').append(
            `<li class="message info"><user>${username}</user>Connected</li>`
          )
        }
        $('.main__participants_list').append(`<li>${username}</li>`)
        scrollToBottom()
      })
      let text = $('#chat_message')
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          socket.emit('message', text.val())
          text.val('')
          picker.hidePicker()
        }
      })
      // Create message event
      socket.on('createMessage', (message, username, userColor) => {
        const date = new Date()
        const minutes = date.getMinutes()

        function twoDigits(minutes) {
          return ('0' + minutes).slice(-2)
        }
        const currentTime = date.getHours() + ':' + twoDigits(minutes)
        $('.messages').append(
          `<li class="message"><date>${currentTime} </date><user style="color: ${userColor}">${username}</user>${message}<br></li>`
        )
        scrollToBottom()
        feedback.innerHTML = ''
      })

      $('#change_usernameInput').attr('placeholder', username)
      changeUsername()
    })
}

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

//User disconnected event
const peers = {}
socket.on('user-disconnected', (userId, username, users) => {
  if (peers[userId]) peers[userId].close()
  let containsRu = main.classList.contains('ru')
  if (containsRu == true) {
    $('.messages').append(
      `<li class="message info"><user>${username}</user>Отсоединился</li>`
    )
  } else {
    $('.messages').append(
      `<li class="message info"><user>${username}</user>Disconnected</li>`
    )
  }
  participantsList.innerHTML = ''
  users.forEach((user) => {
    const name = user.username
    $('.main__participants_list').append(`<li>${name}</li>`)
  })
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

const scrollToBottom = () => {
  var d = $('.main__chat_window')
  d.scrollTop(d.prop('scrollHeight'))
}

// Leave Meeting button

const leaveMeetingButton = document.querySelector('.main__leave_meeting')

leaveMeetingButton.addEventListener('click', leaveMeeting)

function leaveMeeting() {
  const video = document.querySelector('video')
  const mediaStream = video.srcObject
  const tracks = mediaStream.getTracks()
  tracks[0].stop()
  tracks.forEach((track) => track.stop())
  window.close()
  setStopVideo()
  setMuteButton()
  $('.messages').append(`<li class="message info">You left the meeting</li>`)
  scrollToBottom()
}

// Mute/Unmute and play/stop video buttons
const muteButton = document.querySelector('.main__mute_button')
muteButton.addEventListener('click', muteUnmute)
const stopVideoButton = document.querySelector('.main__video_button')
stopVideoButton.addEventListener('click', playStop)

// Hide and show chat
const chatButton = document.querySelector('.main__chat_button')
const chat = document.querySelector('.main__right')
const left = document.querySelector('.main__left')
chatButton.addEventListener('click', hideShowChat)

function hideShowChat() {
  left.classList.toggle('hiden_chat')
  chat.classList.toggle('hide_chat')
}

// Change theme
const main_theme_button = document.querySelector('.main_theme_button')
const body = document.body
const themeIcon = document.getElementById('themeIcon')

export function toogleThemeBtn() {
  if (body.classList.contains('light')) {
    themeIcon.className = 'fa-solid fa-sun'
  } else {
    themeIcon.className = 'fa-solid fa-moon'
  }
}

if (!localStorage.theme) localStorage.theme = 'dark'
body.className = localStorage.theme
toogleThemeBtn()

main_theme_button.addEventListener('click', () => {
  body.classList.toggle('light')
  toogleThemeBtn()
  localStorage.theme = body.className || 'dark'
})

// Participants
const participantsBtn = document.querySelector('.main__participants_button')
const participantsList = document.querySelector('.main__participants_list')
participantsList.style.listStyleType = 'decimal'
participantsBtn.addEventListener('click', openClosePopUp)
openClosePopUp()

// Emoji
const input = document.getElementById('chat_message')
const emojiBtn = document.querySelector('.main__message_emoji_btn')
let picker = new EmojiButton({
  position: 'top',
  autoHide: false,
})

picker.on('emoji', function (emoji) {
  input.value += emoji
  input.focus()
})

emojiBtn.addEventListener('click', function () {
  picker.pickerVisible ? picker.hidePicker() : picker.showPicker(input)
})

// Share Link
const copyToClipboardButton = document.querySelector('.main__share_button')
copyToClipboardButton.addEventListener('click', copyToClipboard)

// Settings
const openSettingsBtn = document.querySelector('.main__settings_button')
const closeSettingsBtn = document.querySelector('#close')
const overlay = document.getElementById('overlay')
openSettingsBtn.addEventListener('click', openPopUp)
closeSettingsBtn.addEventListener('click', closePopUp)
overlay.addEventListener('click', closePopUp)

// Translate
export const main = document.querySelector('.main')
const enBtn = document.querySelector('.lang_en')
const ruBtn = document.querySelector('.lang_ru')
document.addEventListener('DOMContentLoaded', getLocalLang)

enBtn.addEventListener('click', makeLangEN)
ruBtn.addEventListener('click', makeLangRU)

$(function () {
  $('.translate').click(function () {
    let lang = $(this).attr('id')
    saveLocalLang(lang)
    $('.lang').each(function (index, item) {
      $(this).text(arrLang[lang][$(this).attr('key')])
    })
    checkPlaceholder()
  })
})

function getLocalLang() {
  let langs
  if (localStorage.getItem('langs') === null) {
    langs = []
  } else {
    langs = JSON.parse(localStorage.getItem('langs'))
  }
  langs.forEach(function (language) {
    let lang = langs[langs.length - 1]
    $('.lang').each(function (index, item) {
      $(this).text(arrLang[lang][$(this).attr('key')])
    })
    if (lang === 'ru') {
      makeLangRU()
    } else {
      makeLangEN()
    }
    checkPlaceholder()
  })
}

// Change username
$('#change_usernameInput').click(() => {
  $('.change_usernameInfo').css('opacity', '1')
})