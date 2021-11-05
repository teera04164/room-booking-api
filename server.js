require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
// const serverless = require('serverless-http');

const config = require('./config')
const { username, password } = config.mongoDB
const cors = require('cors');
const routes = require('./src/route');
const app = express()

const optionMongo = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoReconnect: true,
  keepAlive: 1,
  connectTimeoutMS: 30000,
  reconnectTries: 30,// Retry up to 30 times
  reconnectInterval: 500,// Reconnect every 500ms
  poolSize: 10 // Maintain up to 10 socket connections
}
mongoose.Promise = global.Promise;

// mongoose.connect(`mongodb://${username}:${password}@ds024748.mlab.com:24748/upskill-db`, optionMongo)
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.in8lm.mongodb.net/booking-db?retryWrites=true&w=majority`, optionMongo)
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err))


app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', routes)


const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
