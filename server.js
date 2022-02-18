const express = require('express')
const app = express()
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid')

app.set('view engine', 'ejsf')

app.get('/', (request, response) => {
    response.render('room')
})


server.listen(3000)