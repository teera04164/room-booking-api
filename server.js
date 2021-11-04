const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
// const serverless = require('serverless-http');

const config = require('./config')
const { username, password } = config.mongoDB
const cors = require('cors');
const { timeBook } = require('./src/models/timeBook.model');
const { building } = require('./src/models/building.model');
const { roomType } = require('./src/models/roomType.model');
const { room } = require('./src/models/room.model');
const { booking } = require('./src/models/booking.model');
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


app.get('/time-booking', async (req, res) => {
  const result = await timeBook.find({}).select('_id time_booking_name').sort({ time_booking_name: 1 })
  res.json(result)
})

app.get('/building', async (req, res) => {
  const result = await building.find({}).select('_id building_name').sort({ building_name: 1 })
  res.json(result)
})

const getAllRoomWithBookingByRoomList = async (listRoom) => {
  const result = await Promise.all(
    listRoom.map(async eachRoom => {
      const { _id: room_id } = eachRoom
      const resultBooking = await getBookingByRoomId(room_id)
      return {
        ...eachRoom,
        booking: resultBooking
      }
    })
  )
  return result
}

const getBookingByRoomId = async (room_id) => {
  return await booking.find({ room_id }).select('-__v').lean()
}

app.get('/booking', async (req, res) => {
  const { building_id } = req.query
  const allRoomType = await roomType.find({ building_id }).select('-createdAt -updatedAt -__v').lean()
  const newResult = await Promise.all(allRoomType.map(async (eactRoomType) => {
    const { _id: room_type_id } = eactRoomType
    const allRoom = await room.find({ room_type_id }).select('-createdAt -updatedAt -__v').lean()
    const newAllRoom = await getAllRoomWithBookingByRoomList(allRoom)
    return {
      ...eactRoomType,
      rooms: newAllRoom
    }
  }))
  res.json(newResult)
})

app.post('/booking', async (req, res) => {
  const { building_id, room_type_id, room_id, time_booking_id } = req.body
  const result = await booking.create({ building_id, room_type_id, room_id, time_booking_id })
  res.json({ result })
})

// app.use('/', routes); 

const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
