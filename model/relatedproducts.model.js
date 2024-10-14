const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const relatedProductSchema = new Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: "Product"  
    },
    relatedProduct: { 
        type: Schema.Types.ObjectId, 
        ref: "Product"
    },
}, { timestamps: true });

const RelatedProduct = mongoose.model("RelatedProduct", relatedProductSchema);
module.exports = RelatedProduct;
