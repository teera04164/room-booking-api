const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        building_id: { type: Schema.Types.ObjectId, ref: "building" },
        room_type_id: { type: Schema.Types.ObjectId, ref: "room_type" },
        room_id: { type: Schema.Types.ObjectId, ref: "room" },
        time_booking_id: { type: Schema.Types.ObjectId, ref: "time_booking" },
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


const booking = mongoose.model("booking", schema, "booking");
module.exports = { booking };
