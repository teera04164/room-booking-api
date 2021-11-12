const dayjs = require('dayjs')
const { RoomType, Room, Booking } = require('../../src/models')
const { redisDB } = require('../../src/db/redisDB')
const broadcastService = require('./broadcast.service')

const getBooking = async ({ building_id, selected_date }) => {
    const day = dayjs(selected_date).format('DD-MM-YYYY')
    const keyCache = `${building_id}-${day}`
    const cached = await redisDB.get(keyCache)
    if (cached) {
        console.log('in use cache ', keyCache, cached)
        return cached
    }
    console.log('in not use cache')

    const allRoomType = await RoomType.find({ building_id })
        .sort({ room_type_name: -1 })
        .select('-createdAt -updatedAt -__v')
        .lean()
    const newResult = await Promise.all(
        allRoomType.map(async (eactRoomType) => {
            const { _id: room_type_id } = eactRoomType
            const allRoom = await Room.find({ room_type_id }).select('-createdAt -updatedAt -__v').lean()
            const newAllRoom = await getAllRoomWithBookingByRoomList(allRoom, selected_date)
            return {
                ...eactRoomType,
                rooms: newAllRoom,
            }
        })
    )
    redisDB.set(keyCache, newResult)
    return newResult
}

const saveBooking = async ({ building_id, room_type_id, room_id, time_booking_id, user_id, selected_date }) => {
    const day = dayjs(selected_date).format('DD-MM-YYYY')
    const result = await Booking.create({
        building_id,
        room_type_id,
        room_id,
        time_booking_id,
        user_id,
        date_booking: day,
    })

    deleteCacheBooking(building_id, selected_date)
    broadcastBooking(building_id, selected_date)
    return result
}

const deleteBooking = async (req, res) => {
    const { booking_id } = req.query
    const {
        user: { user_id },
    } = req.user

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

const broadcastBooking = async (building_id, selected_date) => {
    const day = dayjs(selected_date).format('DD-MM-YYYY')
    let result = await getBooking({ building_id, selected_date })
    broadcastService.broadcast(`${building_id}-${day}`, result)
}

module.exports = {
    getBooking,
    saveBooking,
    deleteBooking,
}
