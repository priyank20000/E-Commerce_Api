const mongoose = require('mongoose');
const Schema=mongoose.Schema

const shippingChargeSchema = new mongoose.Schema({
    state: {
        type: Schema.Types.ObjectId,
        ref: 'State'
    },
    charges: {
        type: Number
    },
    kg: {
        type: Number
    }
});

const ShippingCharge = mongoose.model('ShippingCharge', shippingChargeSchema);

module.exports = ShippingCharge;
