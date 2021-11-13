
const app = require('../../server')

const broadcast = (event, data) => {
    console.log('in bordcast ', {
        event, data: null
    });
    const io = app.getSocketIo()
    io.to(event).emit('update-date', data)
    console.log('after emit');
}

module.exports = {
    broadcast
}