require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const config = require('./config')
const routes = require('./src/route')
const { mongoDB } = config
const app = express()

mongoose.Promise = global.Promise

mongoose.connect(mongoDB.connectString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: mongoDB.username,
    pass: mongoDB.password,
    autoReconnect: true,
    keepAlive: 1,
    connectTimeoutMS: 30000,
    reconnectTries: 30,// Retry up to 30 times
    reconnectInterval: 500,// Reconnect every 500ms
    poolSize: 10 // Maintain up to 10 socket connections
}).then(() => console.log('connection successful'))
    .catch((err) => console.error(err))

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', routes)

const port = process.env.PORT || 5002
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
