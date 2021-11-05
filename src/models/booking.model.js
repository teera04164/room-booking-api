const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        building_id: { type: Schema.Types.ObjectId, ref: "building" },
        room_type_id: { type: Schema.Types.ObjectId, ref: "room_type" },
        room_id: { type: Schema.Types.ObjectId, ref: "room" },
        time_booking_id: { type: Schema.Types.ObjectId, ref: "time_booking" },
        date_booking: { type: String },
        user_id: { type: Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

// schema.set("toJSON", {
//     virtuals: true,
//     transform: function (doc, result) {
//         delete result.__v
//         delete result.createdAt
//         delete result.updatedAt
//         delete result.id
//         return {
//             booking_id: result._id,
//             ...result,
//             _id: undefined
//         };
//     },
// });


const Booking = mongoose.model("booking", schema, "booking");
module.exports = { Booking };
