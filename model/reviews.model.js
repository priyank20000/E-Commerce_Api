const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type : String,
        required: true
    },
    rating: {
        type: Number,
        required: true 
    },
    comment: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    }
})


const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;

