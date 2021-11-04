const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema(
    {
        time_booking_name: { type: String },
    },
    { timestamps: true }
)



// schema.set("toJSON", {
//     virtuals: true,
//     transform: function (doc, result) {
//         delete result.__v
//         delete result.createdAt
//         delete result.updatedAt
//         delete result.id
//         return {
//             time_booking_id: result._id,
//             ...result,
//             _id: undefined
//         };
//     },
// });

const timeBook = mongoose.model('time_booking', schema, 'time_booking')
module.exports = { timeBook }