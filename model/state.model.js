const mongoose = require('mongoose');
const Schema=mongoose.Schema

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country'
    },
    isPublished: {
        type: Boolean,
        default: true
    }
})

const State = mongoose.model('State', stateSchema);

module.exports = State