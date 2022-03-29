const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
})

// Modal Window with username

window.addEventListener('load', function () {
  if (localStorage.getItem('username') === null) {
    openUsernamePopUp()
    getUsernameOnEnter()
  }
  setUsernameLocal(localStorage.getItem('username').toString())
})

const usernamePopUp = document.querySelector('.main__username_popup')
const usernameOverlay = document.getElementById('usernameOverlay')

function openUsernamePopUp() {
  usernamePopUp.style.visibility = 'visible'
  usernamePopUp.style.opacity = '1'
  usernameOverlay.style.visibility = 'visible'
  usernameOverlay.style.opacity = '1'
}
function closeusernamePopUp() {
  usernamePopUp.style.visibility = 'hidden'
  usernamePopUp.style.opacity = '0'
  usernameOverlay.style.visibility = 'hidden'
  usernameOverlay.style.opacity = '0'
}

function getUsernameOnEnter() {
    let text = $('#usernameInput')
    $('#usernameInput').on('keypress', function (e) {
      if (e.which == 13 && text.val().length !== 0 && text.val() !== ' ') {
        getUsername()
      }
    })
}

function getUsername() {
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

function setUsernameLocal(username) {
  localStorage.setItem('username', username)
  startApp()
}

var myVideoStream

function startApp() {
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
      // input value
      let text = $('#chat_message')
      // when press enter send message
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          socket.emit('message', text.val())
          text.val('')
          picker.hidePicker()
        }
      })

      socket.on('createMessage', (message, username, userColor) => {
        const date = new Date
        const minutes = date.getMinutes()
        function twoDigits(minutes) {
          return ('0' + minutes).slice(-2)
        }
        const currentTime = date.getHours() + ':' + twoDigits(minutes)
        $('.messages').append(
          `<li class="message"><date>${currentTime} </date><user style="color: ${userColor}">${username}</user>${message}<br></li>`
        )
        scrollToBottom()
      })
      $('#change_usernameInput').attr('placeholder', username)
      changeUsername()
    })
}

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

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

const leaveMeeting = () => {
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

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}

const micIcon = document.getElementById('microIcon')
const videoIcon = document.getElementById('videoIcon')

const setMuteButton = () => {
  micIcon.className = 'fa-solid fa-microphone'
}

const setUnmuteButton = () => {
  micIcon.className = 'unmute fa-solid fa-microphone-slash'
}

const setStopVideo = () => {
  videoIcon.className = 'fas fa-video'
}

const setPlayVideo = () => {
  videoIcon.className = 'stop fas fa-video-slash'
}

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

function toogleThemeBtn() {
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
const participantsWindow = document.querySelector(
  '.main__participants_popup_container'
)
const participantsList = document.querySelector('.main__participants_list')
participantsList.style.listStyleType = 'decimal'

participantsBtn.addEventListener('click', openClosePopUp)
openClosePopUp()

function openClosePopUp() {
  if (participantsWindow.style.left == '-250px') {
    participantsWindow.style.left = '0px'
  } else {
    participantsWindow.style.left = '-250px'
  }
}

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

function copyToClipboard(text) {
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

//Fullscreen

// function createFullscreen() {
//   const mainVideos = document.querySelector('.main__videos')
//   const fullScreenButton = document.createElement('div')
//   fullScreenButton.className = 'main__fullcsreen-button'
//   const fullScreenIcon = `<i class="fa-solid fa-expand"></i>`
//   fullScreenButton.innerHTML = fullScreenIcon
//   mainVideos.append(fullScreenButton)

//   fullScreenButton.addEventListener('click', () => {
//     const compressBtn = `
//     <i class="fa-solid fa-compress"></i>
//     `
//     const fullscreenBtn = `
//     <i class="fa-solid fa-expand"></i>
//     `
//     if (myVideo.style.width == '720px') {
//       myVideo.style.width = '400px'
//       myVideo.style.height = '300px'
//       fullScreenButton.style.marginTop = '270px'
//       fullScreenButton.innerHTML = fullscreenBtn
//     } else {
//       myVideo.style.width = '720px'
//       myVideo.style.height = '600px'
//       fullScreenButton.style.marginTop = '570px'
//       fullScreenButton.innerHTML = compressBtn
//     }
//   })
// }

// Settings

const openSettingsBtn = document.querySelector('.main__settings_button')
const popUpWindow = document.querySelector('.popup')
const closeSettingsBtn = document.querySelector('#close')
const overlay = document.getElementById('overlay')

function openPopUp() {
  popUpWindow.style.visibility = 'visible'
  popUpWindow.style.opacity = '1'
  overlay.style.visibility = 'visible'
  overlay.style.opacity = '1'
}
function closePopUp() {
  popUpWindow.style.visibility = 'hidden'
  popUpWindow.style.opacity = '0'
  overlay.style.visibility = 'hidden'
  overlay.style.opacity = '0'
}

// Translate

const arrLang = {
  en: {
    participants: 'Participants',
    theme: 'Theme',
    share: 'Share Link',
    mute: 'Mute',
    video: 'Video',
    chat: 'Chat',
    settings: 'Settings',
    leaveMeeting: 'Leave Meeting',
    chatHeader: 'Chat',
    languageHeader: 'Settings',
    langSetting: 'Language',
    usernameSetting: 'Username',
  },
  ru: {
    participants: 'Участники',
    theme: 'Тема',
    share: 'Поделиться',
    mute: 'Звук',
    video: 'Видео',
    chat: 'Чат',
    settings: 'Настройки',
    leaveMeeting: 'Покинуть собрание',
    chatHeader: 'Чат',
    languageHeader: 'Настройки',
    langSetting: 'Язык',
    usernameSetting: 'Имя',
  },
}

const placeholderEnglish = 'Type message here...'
const placeholderRussian = 'Введите сообщение...'
const placeholder = $('#chat_message')

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

function checkPlaceholder() {
  if (placeholder.attr('placeholder') === placeholderEnglish) {
    placeholder.attr('placeholder', placeholderRussian)
  } else {
    placeholder.attr('placeholder', placeholderEnglish)
  }
}

document.addEventListener('DOMContentLoaded', getLocalLang)

function saveLocalLang(language) {
  let langs
  if (localStorage.getItem('langs') === null) {
    langs = []
  } else {
    langs = JSON.parse(localStorage.getItem('langs'))
  }
  langs.push(language)
  localStorage.setItem('langs', JSON.stringify(langs))
}

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

const dropBtn = document.querySelector('.dropbtn')
const langENbtn = document.querySelector('.lang_en')
const langRUbtn = document.querySelector('.lang_ru')
const RUiconHref =
  "url('http://icons.iconarchive.com/icons/custom-icon-design/flag-3/16/Russia-Flag-icon.png') no-repeat left"
const ENiconHref =
  "url('https://icons.iconarchive.com/icons/fatcow/farm-fresh/16/flag-usa-icon.png') no-repeat left"

const main = document.querySelector('.main')

function makeLangRU() {
  main.classList.add('ru')
  dropBtn.style.background = RUiconHref
  dropBtn.innerHTML = 'RU'
  $('.change_usernameInfo').html('Введите имя и нажмите "Enter"')
}

function makeLangEN() {
  main.classList.remove('ru')
  dropBtn.style.background = ENiconHref
  dropBtn.innerHTML = 'EN'
  $('.change_usernameInfo').html('Type your username and click "Enter"')
}

// Change username

function changeUsername() {
  let text = $('#change_usernameInput')
  $('#change_usernameInput').on('keypress', function (e) {
    if (e.which == 13 && text.val().length !== 0 && text.val() !== ' ') {
      localStorage.setItem('username', text.val())
      document.location.reload()
    }
  })
}

$('#change_usernameInput').click(() => {
  $('.change_usernameInfo').css('opacity', '1')
})
