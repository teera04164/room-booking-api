require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const routes = require('./src/route')
const { redisDB } = require('./src/db/redisDB')
const { mongoDB } = require('./src/db/mongoDB')
const http = require('http')
const { Server } = require('socket.io')
const { bookingService } = require('./src/services')
const dayjs = require('dayjs')
const server = http.createServer(app)

const io = new Server(server, { cors: {} })

io.on('connection', async (socket) => {
    console.log(`User Connected: ${socket.id}`)

    // let result = await redisDB.get('6183fc7d7e115ccbf5f09328-08-11-2021')
    // socket.emit("booking", result);

    socket.on('join_room', async ({ building_id, selected_date }) => {
        const keyCache = `${building_id}-${selected_date}`
        if (building_id && selected_date) {
            socket.join(keyCache)
            console.log(`User with ID: ${socket.id} joined room: ${keyCache}`)
            const result = await bookingService.getBooking({ building_id, selected_date })
            io.to(keyCache).emit('update-date', result)
        }
    })

    socket.on('leve_room', ({ building_id, selected_date }) => {
        const keyCache = `${building_id}-${selected_date}`
        socket.leave(keyCache)
        console.log(`User with ID: ${socket.id} leve room: ${keyCache}`)
    })

    socket.on('get-booking', async (data) => {
        console.log('in get booking', data);
        const { building_id, selected_date } = data
        const keyCache = `${building_id}-${selected_date}`
        const result = await bookingService.getBooking({ building_id, selected_date })
        io.to(keyCache).emit('update-date', result)
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
