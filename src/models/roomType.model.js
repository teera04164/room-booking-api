const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new mongoose.Schema(
    {
        building_id: { type: Schema.Types.ObjectId, ref: 'building' },
        room_type_name: { type: String, require: true }
    },
    { timestamps: true }
)

schema.set("toJSON", {
    virtuals: true,
    transform: function (doc, result) {
        delete result.__v
        delete result.createdAt
        delete result.updatedAt
        delete result.id
        return {
            room_type_id: result._id,
            ...result,
            _id: undefined
        };
    },
});

const roomType = mongoose.model('room_type', schema, 'room_type')
module.exports = { roomType }