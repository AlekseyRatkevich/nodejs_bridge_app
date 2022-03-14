const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true,
})
const { v4: uuidV4 } = require('uuid')
const PORT = process.env.PORT || 3030

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

const users = []

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.on('username', (username) => {
      socket.emit('username-back', username)
      users.push(username)
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId, username)
      // messages
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomId).emit('createMessage', message, username)
      })
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId, username)
      })
    })
  })
})

server.listen(PORT)
