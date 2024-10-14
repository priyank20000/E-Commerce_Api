const mongoose = require("mongoose");
const Schema=mongoose.Schema

const addressSubSchema = new mongoose.Schema({
    address_1: { 
        type: String, 
        required: true 
    },
    address_2: { 
        type: String, 
        required: true 
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: { 
        type: Schema.Types.ObjectId,
        ref: 'State'
    },
    city: { 
        type: String, 
        required: true 
    },
    pincode: { 
        type: Number, 
        required: true 
    },
    nearby: { 
        type: String, 
        required: false 
    },
    type_of_address: { 
        type: String, 
        required: true, 
        default: "home" 
    },
    phoneNumber: { 
        type: String, 
        required: false 
    }
})

const addressesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: [addressSubSchema]
},
{
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330;
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
})

const Addresses = new mongoose.model("Address", addressesSchema)
module.exports = Addresses