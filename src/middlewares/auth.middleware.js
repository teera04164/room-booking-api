const jwt = require("jsonwebtoken");
require('dotenv').config()

module.exports.verifyToken = (req, res, next) => {
    if (req.headers.authorizationd && req.headers.authorizationd.startsWith('Bearer')) {
        try {
            const token = req.headers.authorizationd.split(' ')[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded
            next();
        } catch (error) {
            // console.log(error);
            res.status(401).json({ sucess: false, message: 'Something went wrong!!' })
        }
    } else {
        res.status(401).json({ sucess: false, message: 'Not Authorized' })
    }
}

module.exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

module.exports.decodeRefreshToken = (token) => {
    return jwt.decode(token)
}

module.exports.verifyExpiration = (token) => {
    const jwtDecode = jwt.decode(token)
    return jwtDecode.exp < new Date().getTime();
}

module.exports.createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
}