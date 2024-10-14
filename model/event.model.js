const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPublished: {
        type: Boolean,
        default: false,
    }
});

const eventSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'ImgUrl',
    },
    description: {
        type: String,
        required: false
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'EventCategory',
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
    comments: [commentSchema]  // Array of comment subdocuments
},
{ timestamps:true }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
