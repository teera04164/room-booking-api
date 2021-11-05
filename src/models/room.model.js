const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema(
    {
        room_type_id: { type: Schema.Types.ObjectId, ref: 'room_type' },
        room_name: { type: String, require: true }
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
            room_id: result._id,
            ...result,
            _id: undefined
        };
    },
});

const Room = mongoose.model('room', schema, 'room')
module.exports = { Room }