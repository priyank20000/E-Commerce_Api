const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogcategorySchema = new mongoose.Schema ({
    name: {
        type : String,
        required: false
    },
    slug: {
        type: String,
        required: false,
    },
    image:{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
        required: false
    },
    featuredCategory:{
        type: Boolean,
        required: false
    },
    description : {
        type: String,
        required: false
    },
    isPublished: {
        type: Boolean,
        default: false
    }
},
{ timestamps:true }
)


const BlogCategory = new mongoose.model("BlogCategory", blogcategorySchema);

module.exports = BlogCategory;
