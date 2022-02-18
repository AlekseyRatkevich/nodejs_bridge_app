const { response } = require('express')
const express = require('express')
const { request } = require('http')
const app = express()
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid')

app.set('view engine', 'ejs')

app.get('/', (request, response) => {
    response.redirect(`/${uuidv4()}`)
})

app.get('/:room', (request, response) => {
    response.render('room', { roomId: request.params.room })
})

server.listen(3000)