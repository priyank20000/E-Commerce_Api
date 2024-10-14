const mongoose = require("mongoose");

const Schema=mongoose.Schema

const couponSchema = new mongoose.Schema(
    {
      discountType: {
        type: String,
        enum: [
          "percentage-discount",
          "fixed-cart-discount",
          "fixed-product-discount",
        ],
        default: "percentage-discount",
      },
      amount: {
        type: Number,
        default:0,
        required: false,
      },
      code: {
        type: String,
        required: true,
      },
      
      expiryDate: {
        type: Date,
        required: false,
      },
      minimumSpend: {
        type: Number,
        default:0,
        required: false,
      },
      maximumSpend: {
        type: Number,
        default:0,
        required: false,
      },
     
      products: [{type:Schema.Types.ObjectId,ref:"Product"}],
    
      productCategories: [{type:Schema.Types.ObjectId,ref:"Category"}],

    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
      },
      toObject: {
        virtuals: true,
      },
    }
  );
  
  
  
const Coupon = new mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

  
  
  
  
    