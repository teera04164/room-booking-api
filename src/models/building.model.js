const mongoose = require('mongoose')

const schema = new mongoose.Schema(
    {
        building_name: { type: String, require: true },
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
            building_id: result._id,
            ...result,
            _id: undefined
        };
    },
});

const building = mongoose.model('building', schema, 'building')
module.exports = { building }