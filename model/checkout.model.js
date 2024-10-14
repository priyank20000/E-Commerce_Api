const mongoose = require('mongoose');


const cartSubSchema = ({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: false
    }
}
)

const checkOutSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    },
    cart_item: [cartSubSchema],
    payment_method: {
        type: String,
        enum: ["COD", "RAZARPAY"],
        default: "COD"
    },
    shipping_Charge: {
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



const CheckOut = mongoose.model('CheckOut', checkOutSchema);

module.exports = CheckOut;