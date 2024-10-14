const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema ({
    name: {
        type : String,
        required: true
    },
    slug: {
        type: String,
        required: false,
    },
    image:{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
    },
    featuredCategory:{
        type: Boolean,
        required: false
    },
    description : {
        type: String,
        required: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: false
    },
    subCategories: [{
        type: Schema.Types.ObjectId,
        ref: "Category"
    }]
},
{ timestamps:true }
)


const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;
