const popUpWindow = document.querySelector('.popup')
const overlay = document.getElementById('overlay')

export function openPopUp() {
  popUpWindow.style.visibility = 'visible'
  popUpWindow.style.opacity = '1'
  overlay.style.visibility = 'visible'
  overlay.style.opacity = '1'
}

export function closePopUp() {
  popUpWindow.style.visibility = 'hidden'
  popUpWindow.style.opacity = '0'
  overlay.style.visibility = 'hidden'
  overlay.style.opacity = '0'
}