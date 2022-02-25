const express = require('express')
const { request } = require('http')
const app = express()
const server = require('http').Server(app)
// const PORT = process.env.PORT || 3000
const PORT = 3030
server.listen(PORT)



const { ExpressPeerServer } = require ('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true
})

const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use('/peerjs', peerServer)
app.get('/', (request, response) => {
    response.redirect(`/${uuidv4()}`)
})

app.get('/:room', (request, response) => {
    response.render('room', { roomId: request.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})

// server.listen(PORT)
