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
    let result = await bookingService.deleteBooking({ booking_id, user_id })
    if (result) {
        res.json({ result })
    } else {
        res.status(400).json({ message: 'not found booking' })
    }
}


module.exports = {
    getBooking,
    saveBooking,
    deleteBooking
}