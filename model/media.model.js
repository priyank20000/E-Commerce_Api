const { default: mongoose } = require("mongoose");
const image = new mongoose.Schema({
    altText: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    size: {
        type: Number,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    dimension: {
        width: {
            type: Number
        },
        height: {
            type: Number
        }
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
const ImgUrl = new mongoose.model('ImgUrl', image)
module.exports = ImgUrl