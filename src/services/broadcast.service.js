
const app = require('../../server')

const broadcast = (event, data) => {
    console.log('in bordcast ', { event, data });
    const io = app.getSocketIo()
    io.emit(event, data)
}

module.exports = {
    broadcast
}