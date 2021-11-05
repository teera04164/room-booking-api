const express = require('express');
const { TimeBook } = require('../src/models/timeBook.model');
const { Building } = require('../src/models/building.model');
const { RoomType } = require('../src/models/roomType.model');
const { Room } = require('../src/models/room.model');
const { Booking } = require('../src/models/booking.model');
const { User } = require('../src/models/user.model');
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get('/time-booking', async (req, res) => {
    const result = await TimeBook.find({}).select('_id time_booking_name').sort({ time_booking_name: 1 })
    res.json(result)
})

router.get('/building', async (req, res) => {
    const result = await Building.find({}).select('_id building_name').sort({ building_name: 1 })
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
    return await Booking.find({ room_id }).select('-__v').lean()
}

router.get('/booking', async (req, res) => {
    const { building_id } = req.query
    const allRoomType = await RoomType.find({ building_id }).sort({ room_type_name: -1 }).select('-createdAt -updatedAt -__v').lean()
    const newResult = await Promise.all(allRoomType.map(async (eactRoomType) => {
        const { _id: room_type_id } = eactRoomType
        const allRoom = await Room.find({ room_type_id }).select('-createdAt -updatedAt -__v').lean()
        const newAllRoom = await getAllRoomWithBookingByRoomList(allRoom)
        return {
            ...eactRoomType,
            rooms: newAllRoom
        }
    }))
    res.json(newResult)
})

router.post('/booking', async (req, res) => {
    const { building_id, room_type_id, room_id, time_booking_id, user_id } = req.body
    const result = await Booking.create({ building_id, room_type_id, room_id, time_booking_id, user_id })
    res.json({ result })
})

router.post('/auth/register', async (req, res) => {
    const { username } = req.body
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
        return res.status(400).json({ error: "Username taken." });
    } else {
        user = await new User(req.body).save();
        const accessToken = await user.createAccessToken();
        const refreshToken = await user.createRefreshToken();

        return res.status(201).json({ accessToken, refreshToken });
    }
})

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body
    console.log("🚀 ~ file: server.js ~ line 107 ~ router.post ~ username, password", username, password)
    try {
        let user = await User.findOne({ username: username.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message: "wrong username or password!" });
        } else {
            let valid = await bcrypt.compare(password, user.password);
            if (valid) {
                const accessToken = await user.createAccessToken();
                const refreshToken = await user.createRefreshToken();
                const { password, ...userNopass } = user._doc
                return res.status(200).json({ ...userNopass, __v: undefined, token: { accessToken, refreshToken } });
            } else {
                return res.status(401).json({ error: "wrong username or password" });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
})

module.exports = router;
