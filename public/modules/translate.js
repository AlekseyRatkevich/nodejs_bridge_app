import { main } from "../script.js"
const placeholder = $('#chat_message')
const placeholderEnglish = 'Type message here...'
const placeholderRussian = 'Введите сообщение...'
const dropBtn = document.querySelector('.dropbtn')
const RUiconHref =
  "url('http://icons.iconarchive.com/icons/custom-icon-design/flag-3/16/Russia-Flag-icon.png') no-repeat left"
const ENiconHref =
  "url('https://icons.iconarchive.com/icons/fatcow/farm-fresh/16/flag-usa-icon.png') no-repeat left"

export function checkPlaceholder() {
  if (placeholder.attr('placeholder') === placeholderEnglish) {
    placeholder.attr('placeholder', placeholderRussian)
  } else {
    placeholder.attr('placeholder', placeholderEnglish)
  }
}

export function makeLangRU() {
  main.classList.add('ru')
  dropBtn.style.background = RUiconHref
  dropBtn.innerHTML = 'RU'
  $('.change_usernameInfo').html('Введите имя и нажмите "Enter"')
}

export function makeLangEN() {
  main.classList.remove('ru')
  dropBtn.style.background = ENiconHref
  dropBtn.innerHTML = 'EN'
  $('.change_usernameInfo').html('Type your username and click "Enter"')
}

export function saveLocalLang(language) {
  let langs
  if (localStorage.getItem('langs') === null) {
    langs = []
  } else {
    langs = JSON.parse(localStorage.getItem('langs'))
  }
  langs.push(language)
  localStorage.setItem('langs', JSON.stringify(langs))
}