const bcrypt = require('bcryptjs')

const { User } = require('../../src/models')
const { redisDB } = require('../db/redisDB')
const { decodeRefreshToken, createAccessToken, verifyExpiration } = require('../middlewares/auth.middleware')
const tokenModel = require('../models/token.model')

const login = async (req, res) => {
    const { username, password } = req.body
    try {
        let user = await User.findOne({ username: username.toLowerCase() })
        if (!user) {
            return res.status(400).json({ message: 'wrong username or password!' })
        } else {
            let valid = await bcrypt.compare(password, user.password)
            if (valid) {
                const accessToken = await user.createAccessToken()
                const refreshToken = await user.createRefreshToken()
                const { password, ...userNopass } = user._doc
                return res.status(200).json({
                    ...userNopass,
                    __v: undefined,
                    token: { accessToken, refreshToken },
                })
            } else {
                return res.status(400).json({ message: 'wrong username or password' })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

const register = async (req, res) => {
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
}
const refresh = async (req, res) => {
    const { refreshToken: refreshTokenId } = req.body
    try {
        if (!refreshTokenId) {
            return res.status(403).json({ message: 'Refresh Token is required!' });
        }

        const refreshToken = await checkTokenDB(refreshTokenId)
        if (refreshToken) {
            if (verifyExpiration(refreshToken)) {
                res.status(403).json({ message: 'refresh token was expired' })
                const result = await deleteTokenFromDB(refreshTokenId)
                return
            }
            const { user } = decodeRefreshToken(refreshToken)
            const accessToken = createAccessToken({ user })
            return res.status(200).json({ accessToken })
        } else {
            return res.status(403).json({ message: 'not found refresh token' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

const checkTokenDB = async (refreshToken) => {
    const findInCache = await redisDB.get(refreshToken)
    if (findInCache) {
        return findInCache
    } else {
        const findToken = await tokenModel.findById(refreshToken).lean()
        if (findToken) {
            return findToken.token
        }
    }
    return null
}

const deleteTokenFromDB = async (refreshToken) => {
    const result = await tokenModel.deleteOne({ _id: refreshToken })
    const findInCache = await redisDB.del(refreshToken)
    return {
        db: Boolean(result),
        cache: Boolean(findInCache)
    }
}

const logout = async (req, res) => {
    const { refreshToken } = req.body
    try {
        let resultDelete = await deleteTokenFromDB(refreshToken)
        res.status(200).json(resultDelete)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

module.exports = {
    login,
    register,
    refresh,
    logout,
}