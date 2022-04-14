const participantsWindow = document.querySelector('.main__participants_popup_container')

export function openClosePopUp() {
  if (participantsWindow.style.left == '-250px') {
    participantsWindow.style.left = '0px'
  } else {
    participantsWindow.style.left = '-250px'
  }
}