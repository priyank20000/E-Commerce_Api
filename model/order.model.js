const mongoose = require('mongoose');

// Define the sub-schema for order items
const orderSubSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: false
    }
});

// Define the main order schema
const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    },
    order_item: [orderSubSchema],
    order_code: {
        type: String,
        required: false
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    order_status: {
        type: String,
        enum: ["order_placed","pending", "processing", "delivered", "canceled"],
        default: "pending"
    },
    payment: {
        type: String,
        enum: ["COD", "RAZARPAY"],
        default: "COD"
    },
    payment_id: {
        type: String,
        required: false
    },
    payment_status: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid"
    },
    isPaymentSuccess: {
        type: Boolean,
        default: false
    },
    shipping_charge: {
        type: Number,
        required: false
    },
    gst: {
        type: Number,
        required: false
    },
    totalPrice: {
        type: Number,
        required: false
    },
    isShipped: {
        type: Boolean,
        default: false
    }
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
});



const Order = mongoose.model('Order', orderSchema);

module.exports = Order;