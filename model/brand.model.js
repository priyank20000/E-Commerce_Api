const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandSchema = new mongoose.Schema ({
    name: {
        type : String,
        required: true
    },
    logo: [{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
    }],
    description : {
        type: String,
        required: true
    }
},
{ timestamps:true }
)


const Brand = new mongoose.model("Brand", brandSchema);

module.exports = Brand;

