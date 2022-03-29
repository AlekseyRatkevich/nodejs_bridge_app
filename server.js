const express = require('express')
const PORT = process.env.PORT || 3030
const path = require('path')
const favicon = require('serve-favicon')
const app = express()
app.use(express.static('public'))
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true,
})
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer)
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

function User(userId, username) {
  this.userId = userId
  this.username = username
}

const users = []
const colors = [
  'MediumVioletRed',
  'Coral',
  'Gold',
  'Violet',
  'YellowGreen',
  'LightSeaGreen',
  'DarkOrange',
]

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.on('username', (username) => {
      function randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1)
        return Math.round(rand)
      }
      let userColor = colors[`${randomInteger(0, 6)}`]
      users.push(new User(userId, username))
      socket.emit('username-back', username, users)

      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId, username)
      socket.on('message', (message) => {
        io.to(roomId).emit('createMessage', message, username, userColor)
      })
      socket.on('typing', (username, containsRu) => {
        socket.local.emit('typing', username, containsRu)
      })
      socket.on('disconnect', () => {
        for (let index = 0; index < users.length; index++) {
          const element = users[index]
          if (element.userId === userId) {
            users.splice(index, 1)
            break
          }
        }
        socket.to(roomId).emit('user-disconnected', userId, username, users)
      })
    })
  })
})

server.listen(PORT)
