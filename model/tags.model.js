const mongoose = require("mongoose");
const Schema=mongoose.Schema


const tagSchema = new mongoose.Schema({ 
   
    tag:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
},
{ timestamps:true }
)


const Tags = new mongoose.model("Tags", tagSchema)
module.exports = Tags
