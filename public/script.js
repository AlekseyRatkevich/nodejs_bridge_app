const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
})

const myVideo = document.createElement('video')
myVideo.className = 'myvideo'
myVideo.muted = true

let myVideoStream
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

    const username = prompt('Please, write your username', 'User')

    // createFullscreen()

    socket.emit('username', username)
    socket.on('username-back', (username, users) => {
      $('.messages').append(`<li class="message info">You are connected</li>`)
      users.forEach(user => {
        const name = user.username
        $('.main__participants_list').append(`<li>${name}</li>`)
      })
      scrollToBottom()
    })
    socket.on('user-connected', (userId, username) => {
      connectToNewUser(userId, stream)
      $('.messages').append(
        `<li class="message info"><user>${username}</user>Has been connected</li>`
      ) 
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
    socket.on('createMessage', (message, username) => {
      $('.messages').append(
        `<li class="message"><user>${username}</user>${message}</li>`
      )
      scrollToBottom()
    })
  })

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

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

const peers = {}
socket.on('user-disconnected', (userId, username, users) => {
  if (peers[userId]) peers[userId].close()
  $('.messages').append(
    `<li class="message info"><user>${username}</user>Has been disconnected</li>`
  )
  // $('.main__participants_popup_container').textContent = ''
  participantsList.innerHTML = ''
  console.log(users)
  users.forEach(user => {
    const name = user.username
    $('.main__participants_list').append(`<li>${name}</li>`)
  })
})

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
  let enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html
}

const setPlayVideo = () => { 
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html
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

function toogleThemeBtn() {
  if (body.classList.contains('light')) {
    main_theme_button.innerHTML = `
    <i class="fa-solid fa-sun"></i>
    <span>Night Theme</span>
    `
  } else {
    main_theme_button.innerHTML = `
    <i class="fa-solid fa-moon"></i>
    <span>Light Theme</span>
    `
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
const participantsWindow = document.querySelector('.main__participants_popup_container')
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
    position : 'top',
    autoHide: false,
    })

    picker.on('emoji', function(emoji){
        input.value += emoji
        input.focus()
    })

    emojiBtn.addEventListener('click', function(){
        picker.pickerVisible ? picker.hidePicker() : picker.showPicker(input)
    })
