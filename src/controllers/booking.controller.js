const dayjs = require('dayjs')
const { RoomType, Room, Booking } = require('../../src/models')
const { redisDB } = require('../../src/db/redisDB')
const { bookingService } = require('../services')

const getBooking = async (req, res) => {
    const { building_id, selected_date } = req.query
    const booking = await bookingService.getBooking({ building_id, selected_date })
    res.json(booking)
}

const saveBooking = async (req, res) => {
    const { building_id, room_type_id, room_id, time_booking_id, selected_date } = req.body
    const { user: { user_id } } = req.user
    const result = await bookingService.saveBooking({
        building_id,
        room_type_id,
        room_id,
        time_booking_id,
        user_id,
        selected_date,
    })
    res.json({ result })
}

const deleteBooking = async (req, res) => {
    const { booking_id } = req.query
    const { user: { user_id } } = req.user

    const booking = await Booking.findOne({ _id: booking_id, user_id })
    if (booking) {
        const { building_id, date_booking } = booking
        const keyCache = `${building_id}-${date_booking}`
        redisDB.del(keyCache)
        const result = await Booking.deleteOne({ _id: booking_id })
        res.json({ result })
    } else {
        res.status(400).json({ message: 'not found booking' })
    }
}


const getAllRoomWithBookingByRoomList = async (listRoom, selected_date) => {
    const result = await Promise.all(
        listRoom.map(async (eachRoom) => {
            const { _id: room_id } = eachRoom
            const resultBooking = await getBookingByRoomId(room_id, selected_date)
            return {
                ...eachRoom,
                booking: resultBooking,
            }
        })
    )
    return result
}

const getBookingByRoomId = async (room_id, selected_date) => {
    const day = dayjs(selected_date).format('DD-MM-YYYY')
    const result = await Booking.find({ room_id, date_booking: day }).select('-__v').lean()
    return result
}

const deleteCacheBooking = (building_id, selected_date) => {
    const day = dayjs(selected_date).format('DD-MM-YYYY')
    const keyCache = `${building_id}-${day}`
    redisDB.del(keyCache)
}


module.exports = {
    getBooking,
    saveBooking,
    deleteBooking
}