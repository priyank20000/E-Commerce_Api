const mongoose = require("mongoose");


const reques = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Order'
    },
    type:{
        type : String,
        enum : ['order' , 'product'],
        default: 'Product'
    },
    refund_amount:{
        type:Number,
        default:0
    },
    order_item_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Order'
    },
    note:{
        type:String,
        required: false
    },
    reason: {
        type: String,
        required: true,
        enum: ['damaged', 'wrong_item', 'not_as_described', 'other']
    },
    status:{
        type:String,
        enum:['processing',"approved",'cancel','refunded'],
        default:'processing'
    },
    proof_image:{
        type: String,  
        required: false
    },
    refundedDate:{
        type:Date
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
const Request = new mongoose.model("Return_Request",reques)
module.exports = Request