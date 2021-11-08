const { TimeBook, Building, } = require('../../src/models')

const getTimeBooking = async (req, res) => {
    const result = await TimeBook.find({}).select('_id time_booking_name').sort({ time_booking_name: 1 })
    res.json(result)
}

const getBuilding = async (req, res) => {
    const result = await Building.find({}).select('_id building_name').sort({ building_name: 1 })
    res.json(result)
}

module.exports = {
    getTimeBooking,
    getBuilding,
}