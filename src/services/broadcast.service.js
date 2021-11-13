
const app = require('../../server')

const broadcast = (event, data) => {
    const io = app.getSocketIo()
    io.to(event).emit('update-date', data)
}

module.exports = {
    broadcast
}