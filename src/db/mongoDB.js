

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGO_HOST, {
            useNewUrlParser: true,
            useCreateIndex: true,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PWD,
            autoReconnect: true,
            keepAlive: 1,
            connectTimeoutMS: 30000,
            reconnectTries: 30,// Retry up to 30 times
            reconnectInterval: 500,// Reconnect every 500ms
            poolSize: 10 // Maintain up to 10 socket connections
        })

        mongoose.connection.on('error', (error) => {
            reject(error);
            console.log('Database error: ' + error)
        });

        mongoose.connection.on('connected', () => {
            console.log('Connected to database');
            resolve()
        });
    })
}

const disconnect = async () => {
    return await mongoose.connection.close()
}

module.exports.mongoDB = {
    connect,
    disconnect
}