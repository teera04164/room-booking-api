const { TimeBook, Building, } = require('../../src/models')
const { redisDB } = require('../db/redisDB')
const app = require('../../server')
let count = 0
const getAllKey = async (req, res) => {
    const { building } = req.query
    const result = await redisDB.getAllKey()
    const io = app.getSocketIo()
    ++count
    io.emit('hi', 'count => ' + count)
    res.json(result)
}

const deleteAllKey = async (req, res) => {
    const result = await redisDB.delAllKey()
    res.json(result)
}

const deleteKey = async (req, res) => {
    const { key } = req.query
    const result = await redisDB.del(key)
    res.json(result)
}

module.exports = {
    getAllKey,
    deleteAllKey,
    deleteKey,
}