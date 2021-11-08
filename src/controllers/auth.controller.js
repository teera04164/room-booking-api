const bcrypt = require('bcryptjs')

const { User } = require('../../src/models')
const { decodeRefreshToken, createAccessToken } = require('../middlewares/auth.middleware')

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
    const { refreshToken } = req.body
    try {
        let decode = decodeRefreshToken(refreshToken)
        const { user } = decode
        const accessToken = createAccessToken(user)
        res.status(200).json({ accessToken })
        // let user = await User.findOne({ username: username.toLowerCase() })
        // if (!user) {
        //     return res.status(400).json({ message: 'wrong username or password!' })
        // } else {
        //     let valid = await bcrypt.compare(password, user.password)
        //     if (valid) {
        //         const accessToken = await user.createAccessToken()
        //         const refreshToken = await user.createRefreshToken()
        //         const { password, ...userNopass } = user._doc
        //         return res.status(200).json({
        //             ...userNopass,
        //             __v: undefined,
        //             token: { accessToken, refreshToken },
        //         })
        //     } else {
        //         return res.status(400).json({ message: 'wrong username or password' })
        //     }
        // }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error!' })
    }
}

module.exports = {
    login,
    register,
    refresh
}