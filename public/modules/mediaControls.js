import {
  myVideoStream
} from "../script.js"

export function muteUnmute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

export function playStop() {
  const myVideo = document.querySelector('.myvideo')
  const enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideo.style.display = 'none'
    setPlayVideo()
    myVideoStream.getVideoTracks()[0].enabled = false
  } else {
    myVideo.style.display = 'block'
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