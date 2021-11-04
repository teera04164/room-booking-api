require('dotenv').config()
const config = require('../../config')
const { username, password } = config.mongoDB
const seeder = require('mongoose-seed')

const data = [
    ...require('./timeBook.seeder'),
    ...require('./building.seeder'),
    ...require('./roomType.seeder'),
    ...require('./room.seeder'),
    ...require('./booking.seeder')
]

seeder.connect(
    `mongodb+srv://${username}:${password}@cluster0.in8lm.mongodb.net/booking-db?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        // Load Mongoose models
        seeder.loadModels([
            '../models/timeBook.model.js',
            '../models/building.model.js',
            '../models/roomType.model.js',
            '../models/room.model.js',
            '../models/booking.model.js',
        ])

        // Clear specified collections
        seeder.clearModels(['time_booking', 'building', 'room_type', 'room', 'booking'], () => {
            // Callback to populate DB once collections have been cleared
            seeder.populateModels(data, () => {
                seeder.disconnect()
            })
        })
    }
)

// Data array containing seed data - documents organized by Model
