const express = require('express')
const { request } = require('http')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', (request, response) => {
    response.redirect(`/${uuidv4()}`)
})

app.get('/:room', (request, response) => {
    response.render('room', { roomId: request.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', () => {
        console.log('joined a room')
    })
})

server.listen(3000)