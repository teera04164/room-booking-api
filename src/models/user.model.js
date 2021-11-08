const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config()

const { Schema } = mongoose;
const Token = require("./token.model");
const { createAccessToken: genAccessToken } = require("../middlewares/auth.middleware");
const { redisDB } = require("../db/redisDB");
const schema = new Schema(
    {
        user_code: { type: String },
        name: { type: String },
        username: { type: String },
        password: { type: String },
    },
    { timestamps: true }
);

schema.methods = {
    createAccessToken: async function () {
        try {
            let { _id } = this;
            const payload = { user: { user_id: _id } }
            let accessToken = genAccessToken(payload)
            return accessToken;
        } catch (error) {
            console.error(error);
            return;
        }
    },
    createRefreshToken: async function () {
        try {
            let { _id, username } = this;
            let refreshToken = jwt.sign(
                { user: { user_id: _id } },
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
                }
            );
            redisDB.set(refreshToken, '1')
            await new Token({ token: refreshToken }).save();
            return refreshToken;
        } catch (error) {
            console.error(error);
            return;
        }
    },
};

//pre save hook to hash password before saving user into the database:
schema.pre("save", async function (next) {
    try {
        let salt = await bcrypt.genSalt(12); // generate hash salt of 12 rounds
        let hashedPassword = await bcrypt.hash(this.password, salt); // hash the current user's password
        this.password = hashedPassword;
        this.user_id = 'B64' + Math.floor(1000 + Math.random() * 9000)
    } catch (error) {
        console.error(error);
    }
    return next();
});

const User = mongoose.model("user", schema, "user");
module.exports = { User };
