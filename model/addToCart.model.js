const mongoose = require('mongoose')


const addToCart= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        productPrice: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    TotalPrice: {
        type: Number, 
        // default: 0 ,
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
})

const AddToCart = new mongoose.model("AddToCart", addToCart);
module.exports = AddToCart ;
