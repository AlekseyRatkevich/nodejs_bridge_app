export function createFullscreen() {
  const myVideo = document.querySelector('.myvideo')
  const mainVideos = document.querySelector('.main__videos')
  const fullScreenButton = document.createElement('div')
  fullScreenButton.className = 'main__fullcsreen-button'
  const fullScreenIcon = `<i class="fa-solid fa-expand"></i>`
  fullScreenButton.innerHTML = fullScreenIcon
  mainVideos.append(fullScreenButton)

  fullScreenButton.addEventListener('click', () => {
    const compressBtn = `
    <i class="fa-solid fa-compress"></i>
    `
    const fullscreenBtn = `
    <i class="fa-solid fa-expand"></i>
    `
    if (myVideo.style.width == '720px') {
      myVideo.style.width = '400px'
      myVideo.style.height = '300px'
      fullScreenButton.style.marginTop = '270px'
      fullScreenButton.innerHTML = fullscreenBtn
    } else {
      myVideo.style.width = '720px'
      myVideo.style.height = '600px'
      fullScreenButton.style.marginTop = '570px'
      fullScreenButton.innerHTML = compressBtn
    }
  })
}