const mongoose = require('mongoose')
const Schema=mongoose.Schema

const notification = new mongoose.Schema({
    type: {
        type: String,
        enum: ['general', 'application'], //g = all user // appli = one user
        required: false
    },
    target: {
        type: String,
        enum: ['specific', 'user', 'guest'], // sp = user yeah guest dono mein se koi bhi (both)
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, //user id
        ref: 'User',
        required: false
    },
    subtype: {
        type: String,
        enum: ['software-update', 'update', 'offer'],
        required: false
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    image: {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImgUrl',
        require: false
    },
    payload: {
        type: Object,
        required: true
    }
});



const Notification = new mongoose.model('Notification', notification)

module.exports = Notification