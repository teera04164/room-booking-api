require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const routes = require('./src/route')
const { redisDB } = require('./src/db/redisDB')
const { mongoDB } = require('./src/db/mongoDB')
const http = require('http')
const { Server } = require('socket.io')

const server = http.createServer(app)

const io = new Server(server, { cors: {} })

io.on('connection', async (socket) => {
    console.log(`User Connected: ${socket.id}`)

    // let result = await redisDB.get('6183fc7d7e115ccbf5f09328-08-11-2021')
    // socket.emit("booking", result);

    socket.on('join_room', (data) => {
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data)
    })

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id)
    })
})
function getSocketIo() {
    console.log('in getSocketIo')
    return io
}
module.exports.getSocketIo = getSocketIo

const startServer = async () => {
    await mongoDB.connect()
    app.use(cors())
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use('/', routes)

    const port = process.env.PORT || 5002
    server.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

const downServer = async () => {
    await redisDB.close()
    await mongoDB.disconnect()
    process.exit(0)
}

process.on('SIGTERM', () => {
    downServer()
})

process.on('SIGINT', () => {
    downServer()
})

startServer()
