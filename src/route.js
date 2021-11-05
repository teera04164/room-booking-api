const express = require('express')
const dayjs = require('dayjs')
const bcrypt = require('bcryptjs')

const { User, TimeBook, Building, RoomType, Room, Booking } = require('../src/models')

const router = express.Router()

router.get('/time-booking', async (req, res) => {
    const result = await TimeBook.find({}).select('_id time_booking_name').sort({ time_booking_name: 1 })
    res.json(result)
})

router.get('/building', async (req, res) => {
    const result = await Building.find({}).select('_id building_name').sort({ building_name: 1 })
    res.json(result)
})

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
    let day = dayjs(selected_date).format('DD-MM-YYYY')
    let result = await Booking.find({ room_id, date_booking: day }).select('-__v').lean()
    return result
}

router.get('/booking', async (req, res) => {
    const { building_id, selected_date } = req.query
    const allRoomType = await RoomType.find({ building_id }).sort({ room_type_name: -1 }).select('-createdAt -updatedAt -__v').lean()
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
    res.json(newResult)
})

router.post('/booking', async (req, res) => {
    const { building_id, room_type_id, room_id, time_booking_id, user_id, selected_date } = req.body
    let day = dayjs(selected_date).format('DD-MM-YYYY')
    const result = await Booking.create({ building_id, room_type_id, room_id, time_booking_id, user_id, date_booking: day })
    res.json({ result })
})

router.delete('/booking', async (req, res) => {
    const { booking_id } = req.query
    const result = await Booking.deleteOne({ _id: booking_id })
    res.json({ result })
})

router.post('/auth/register', async (req, res) => {
    const { username } = req.body
    let user = await User.findOne({ username: username.toLowerCase() })
    if (user) {
        return res.status(400).json({ error: 'Username taken.' })
    } else {
        user = await new User(req.body).save()
        const accessToken = await user.createAccessToken()
        const refreshToken = await user.createRefreshToken()

        return res.status(201).json({ accessToken, refreshToken })
    }
})

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body
    try {
        let user = await User.findOne({ username: username.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message: 'wrong username or password!' })
        } else {
            let valid = await bcrypt.compare(password, user.password)
            if (valid) {
                const accessToken = await user.createAccessToken()
                const refreshToken = await user.createRefreshToken()
                const { password, ...userNopass } = user._doc
                return res.status(200).json({ ...userNopass, __v: undefined, token: { accessToken, refreshToken } })
            } else {
                return res.status(401).json({ error: 'wrong username or password' })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
})

module.exports = router
