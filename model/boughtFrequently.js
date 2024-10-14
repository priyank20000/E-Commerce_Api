const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boughtFrequentlySchema = new Schema({
    title: { type: String, required: true },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",  
            required: false,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"], 
            required: false,
        },
        discount: { 
            type: Number,
            required: false,
        },
        isAccepted: {
            type: Boolean,
            default: true
        }
    }],
    
}, { timestamps: true });

const BoughtFrequently = mongoose.model("BoughtFrequently", boughtFrequentlySchema);
module.exports = BoughtFrequently;
