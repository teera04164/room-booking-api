const express = require('express')
const router = express.Router()

const { verifyToken } = require('./middlewares/auth.middleware')
const { bookingController, authController, defaultController, redisController } = require('./controllers')
const { cache } = require('./middlewares/cache.middleware')
const { bookingService } = require('./services')


router.get('/time-booking', verifyToken, cache, defaultController.getTimeBooking)
router.get('/building', verifyToken, cache, defaultController.getBuilding)

router.get('/booking', verifyToken, bookingController.getBooking)
router.post('/booking', verifyToken, bookingController.saveBooking)
router.delete('/booking', verifyToken, bookingService.deleteBooking)

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/auth/refresh_token', authController.refresh)
router.post('/auth/logout', authController.logout)

router.get('/redis/getAllKey', redisController.getAllKey)
router.get('/redis/deleteAllKey', redisController.deleteAllKey)
router.get('/redis/deleteKey', redisController.deleteKey)

module.exports = router
