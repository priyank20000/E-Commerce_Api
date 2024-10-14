const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    }, 
    image:{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
    },
    description: {
        type: String,
        required: false
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "BlogCategory",
    }],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false
    },
    authorName: {
        type: String,
        required: false
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
},
{ timestamps:true }
)
    
    
const Blog = new mongoose.model('Blog', blogSchema);

module.exports = Blog;

